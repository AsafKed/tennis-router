from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from engineio.payload import Payload
import os
from database_workers.Neo4j_User_Worker import User_Worker
from database_workers.Neo4j_Player_Worker import Player_Worker
from database_workers.Neo4j_Relation_Worker import Relation_Worker
from database_workers.Neo4j_Similarity_Worker import Similarity_Worker
from database_workers.Neo4j_Parameter_Worker import Parameter_Worker
from database_workers.Neo4j_Event_Worker import Event_Worker
import uuid
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app,resources={r"/*":{"origins":"*"}})
Payload.max_decode_packets = 500
socketio = SocketIO(app, cors_allowed_origins="*")
socketio.init_app(app, cors_allowed_origins="*")

########################
# Get local similarity dfs for faster recommendations
########################
from database_workers.Neo4j_Player_Worker import Player_Worker
player_worker = Player_Worker()
player_names = player_worker.get_player_names()
player_worker.close()
player_names = [record['name'] for record in player_names] # Extract the values into a list
player_names

# Make similarity dfs
from database_workers.Recommender import Recommender
recommender = Recommender(player_names)
recommender.create_similarity_dfs()
similarity_dfs = recommender.similarity_dfs
similarity_dfs

# Write some code here to run the recommender on all users and store the results in the database
# TODO

#################
# HTTP endpoints
#################
@app.route("/users")
def http_call():
    """return JSON with string data as the value"""
    data = {'data':users}
    return jsonify(data)

users = []

##############################
# Requests from the front end
##############################
@app.route("/register", methods=["POST"])
def register_user():
    user_data = request.json
    user_id = user_data["user_id"]
    email = user_data["email"]
    name = user_data["name"]

    neo4j_worker = User_Worker()
    user = neo4j_worker.create_user(name, user_id, email)
    neo4j_worker.close()

    return jsonify(user), 201

@app.route("/users/<user_id>", methods=["GET"])
def get_user(user_id):
    print(user_id)
    neo4j_worker = User_Worker()
    user = neo4j_worker.get_user(user_id)
    neo4j_worker.close()

    return jsonify(user), 200

@app.route("/user-groups/<user_id>", methods=["GET"])
def get_user_groups(user_id):
    print(f'\nGetting groups for user {user_id}\n')
    neo4j_worker = User_Worker()
    groups = neo4j_worker.get_groups_by_user(user_id)
    neo4j_worker.close()
    print(f'Groups found: {groups}\n')

    return jsonify(groups), 200

@app.route("/groups/<group_id>/delete", methods=["DELETE"])
def delete_group(group_id):
    query = request.args.to_dict(flat=False)
    user_id = query['user_id'][0]

    neo4j_worker = User_Worker()
    neo4j_worker.delete_group(group_id, user_id)
    neo4j_worker.close()

    return jsonify({"message": "Group deleted"}), 200

@app.route("/users/<user_id>/similarity_weights", methods=["PUT"])
def update_similarity_weights(user_id):
    similarity_weights = request.json
    similarity_weights = similarity_weights["similarity_weights"]
    # Update this in neo4j
    neo4j_worker = User_Worker()
    neo4j_worker.update_similarity_weights(user_id, similarity_weights)
    neo4j_worker.close()

    return jsonify(similarity_weights), 201

@app.route("/users/<user_id>/get_similarity_weights", methods=["GET"])
def get_similarity_weights(user_id):
    print("Getting similarity weights for user", user_id)
    neo4j_worker = User_Worker()
    similarity_weights = neo4j_worker.get_similarity_weights(user_id)
    neo4j_worker.close()
    print("Similarity weights", similarity_weights)

    return jsonify(similarity_weights), 200

@app.route("/preferences/players", methods=["PUT"])
def update_user_preferences():
    try:
        preferences_data = request.json
        user_id = preferences_data.get("user_id")
        preferences = preferences_data.get("preferences")

        print(f"\nPreferences data:\n{preferences_data}\n")

        neo4j_worker = Parameter_Worker()

        # Save preferences to the user
        if user_id:
            neo4j_worker.save_user_preferences(user_id, preferences)

        # Return players that match the preferences
        players = neo4j_worker.get_players_by_preferences(preferences)
        neo4j_worker.close()

        print(f"\nPlayers:\n{players}\n")

        return jsonify(players), 201
    except Exception as e:
        print(f"\nError:\n{e}\n")
        return jsonify({"message": "Error"}), 500
    
@app.route("/preferences/user/", methods=["PUT"])
def update_user_preferences_by_user_id():
    # This should create a recommend relation between the user and the players
    try:
        preferences_data = request.get_json()

        # Get the data
        user_id = preferences_data.get("user_id")
        preferences = preferences_data.get("preferences")
        recommended_player_names = preferences_data.get("player_names")

        print(f"\nPreferences data:\n{preferences_data}\n")
        print(f"\nPlayer names:\n{recommended_player_names}\n")

        # Get currently recommended players using parameter
        relation_worker = Relation_Worker()
        current_recommended_players = relation_worker.get_player_recommend_relations(user_id, recommendation_type="parameter")

        # Get players to add and remove
        current_recommended_player_names = [player['player_name'] for player in current_recommended_players]

        players_to_add = list(set(recommended_player_names) - set(current_recommended_player_names))
        players_to_remove = list(set(current_recommended_player_names) - set(recommended_player_names))

        for player_name in players_to_add:
            # Find the player object that corresponds to the player name
            player = next((name for name in recommended_player_names if name == player_name), None)
            if player is not None:
                relation_worker.create_player_recommend(user_id=user_id, player_name=player_name, recommendation_type="parameter")

        for player_name in players_to_remove:
            relation_worker.delete_player_recommend(user_id, player_name)
        relation_worker.close()
        return "OK", 201
    except Exception as e:
        print(f"\nError:\n{e}\n")
        return jsonify({"message": "Error"}), 500

@app.route("/users/<user_id>/settings", methods=["PUT"])
def update_user_settings(user_id):
    settings_data = request.json
    # Update this in neo4j
    neo4j_worker = User_Worker()
    days = settings_data["days"]
    neo4j_worker.update_user_settings(user_id, days)
    neo4j_worker.close()

    return jsonify(settings_data), 201

@app.route("/users/<user_id>/settings", methods=["GET"])
def get_user_settings(user_id):
    neo4j_worker = User_Worker()
    settings = neo4j_worker.get_user_settings(user_id)
    neo4j_worker.close()

    return jsonify(settings), 200

@app.route("/group-users/<group_id>", methods=["GET"])
def get_group_users(group_id):
    neo4j_worker = User_Worker()
    users = neo4j_worker.get_users_by_group(group_id)
    neo4j_worker.close()

    return jsonify(users), 200

# Get all players
@app.route('/players', methods=['GET'])
def get_players():
    try:
        print("Getting all players")
        neo4j_worker = Player_Worker()
        players_list = neo4j_worker.get_all_players()
        neo4j_worker.close()
        return json.dumps(players_list, ensure_ascii=False), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Error while getting players'}), 500

# Get similar players
@app.route('/players/similar/<player_name>/', methods=['GET'])
def get_similar_players(player_name):
    # Convert underscores to spaces in player name
    player_name = player_name.replace("_", " ")
    query = request.args.to_dict(flat=False)
    similarity_weight = query['similarity_weight'][0]

    try:
        sim_worker = Similarity_Worker()
        similar_players = sim_worker.get_top_similarities(player_name, similarity_weight)
        sim_worker.close()

        return json.dumps(similar_players, ensure_ascii=False), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Error while getting similar players'}), 500


# User likes player
@app.route('/players/like', methods=['POST'])
def like_player():
    global attribute_weights
    try:
        user_id = request.json['user_id']
        player_name = request.json['name']
        neo4j_worker = Relation_Worker()
        neo4j_worker.create_likes_relation(user_id, player_name)
        neo4j_worker.close()
        return jsonify({'message': 'Successfully liked player'}), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Error while liking player'}), 500

# User unlikes player
@app.route('/players/unlike', methods=['POST'])
def unlike_player():
    global attribute_weights
    try:
        user_id = request.json['user_id']
        player_name = request.json['name']
        neo4j_worker = Relation_Worker()
        neo4j_worker.delete_likes_relation(user_id, player_name)
        neo4j_worker.close()
        return jsonify({'message': 'Successfully unliked player'}), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Error while unliking player'}), 500

# TODO add attribute weights assigned by the user
# TODO add dislike player

# Get liked players
@app.route('/players/liked/<user_id>', methods=['GET'])
def get_liked_players(user_id):
    print(f'Getting liked players for user {user_id}')
    try:
        neo4j_worker = Relation_Worker()
        liked_players = neo4j_worker.get_liked_players(user_id)
        neo4j_worker.close()
        return json.dumps(liked_players, ensure_ascii=False), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Error while getting liked players'}), 500
    
# Get player data
@app.route('/players/data/<player_name>', methods=['GET'])
def get_player_data(player_name):
    try:
        player_name = player_name.replace('_', ' ')
        neo4j_worker = Player_Worker()
        player_data = neo4j_worker.get_player_data(player_name)
        neo4j_worker.close()
        return json.dumps(player_data, ensure_ascii=False), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Error while getting player data'}), 500

#################
# Parameters
#################
@app.route('/parameter_options', methods=['GET'])
def get_parameter_options():
    try:
        print("Getting parameter options")
        neo4j_worker = Parameter_Worker()
        parameter_options = neo4j_worker.get_parameter_options()
        neo4j_worker.close()
        return json.dumps(parameter_options, ensure_ascii=False), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Error while getting parameter options'}), 500

############################
# Recommendations (players)
############################
@app.route('/recommendations/players', methods=['PUT'])
def get_recommendations():
    try:
        # Get JSON query parameters from request
        query = request.args.to_dict(flat=False)
        print(f'\nQuery: {query}\n')

        liked_players = query['liked_players'][0].split(',')
        print(f'Liked players: {liked_players}\n')
        similarity_type = query['similarity_type'][0]
        user_id = query['user_id'][0]

        # Convert underscores to spaces in player names
        liked_players = [player.replace('_', ' ') for player in liked_players]

        recommended_players = recommender.recommend_individual(liked_players, similarity_type)

        print('Recommended players: ', recommended_players)
        # Get attribute weights from query
        # player_names, similarity_type, user_id?
        return json.dumps(recommended_players), 200 
    except Exception as e:
        print(e)
        return jsonify({'error': 'Error while getting recommendations'}), 500
    
@app.route('/recommendations/players/to_db', methods=['PUT'])
def update_recommendations():
    try:
        # Read request body
        data = request.get_json()

        # Get user ID and recommended players from request body
        user_id = data['user_id']
        recommended_players = data['recommended_players']

        # Get currently recommended players
        neo4j_worker = Relation_Worker()
        current_recommended_players = neo4j_worker.get_player_recommend_relations(user_id)
        neo4j_worker.close()
        print(f'\n\nCurrent recommended players: {current_recommended_players}\n\n')
        # Extract player names from recommended players
        recommended_player_names = [player['name'] for player in recommended_players]

        # Get players to add and remove
        current_recommended_player_names = [player['player_name'] for player in current_recommended_players]

        players_to_add = list(set(recommended_player_names) - set(current_recommended_player_names))
        players_to_remove = list(set(current_recommended_player_names) - set(recommended_player_names))

        # Add and remove players
        neo4j_worker = Relation_Worker()
        for player_name in players_to_add:
            # Find the player object that corresponds to the player name
            player = next((player for player in recommended_players if player['name'] == player_name), None)
            if player is not None:
                neo4j_worker.create_player_recommend(user_id=user_id, player_name=player['name'], liked_player_name=player['liked_player'], similarity=player['similarity'], similarity_type=player['similarity_type'])

        for player_name in players_to_remove:
            neo4j_worker.delete_player_recommend(user_id, player_name)
        neo4j_worker.close()


        return jsonify({'message': 'Successfully updated recommended players'}), 200
    
    except Exception as e:
        print(e)
        return jsonify({'error': 'Error while updating recommended players'}), 500
    
#################
# Recommendations (matches)
#################
@app.route('/recommendations/matches/<user_id>', methods=['GET'])
def get_match_recommendations(user_id):
    try:
        # Use the recommender
        matches = recommender.recommend_matches(user_id)
        return json.dumps(matches), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Error while getting match recommendations'}), 500
    
@app.route('/recommendations/matches/to_db', methods=['PUT'])
def update_match_recommendations():
    try:
        # Read request body
        data = request.get_json()
        user_id = data['user_id']

        # Use the recommender
        matches = recommender.recommend_matches(user_id)
        relation_worker = Relation_Worker()
        current_matches = relation_worker.get_match_recommend_relations(user_id)
        # Extract match names from recommended matches and matches
        recommended_match_names = [match['match_name'] for match in matches]
        current_match_names = [match['match_name'] for match in current_matches]

        # Get matches to add and remove
        matches_to_add = list(set(recommended_match_names) - set(current_match_names))
        matches_to_remove = list(set(current_match_names) - set(recommended_match_names))

        # Add and remove matches
        for match_name in matches_to_add:
            # Find the match object that corresponds to the match name
            match = next((match for match in matches if match['match_name'] == match_name), None)
            if match is not None:
                relation_worker.create_match_recommend(user_id=user_id, match_name=match['match_name'], priority=match['priority'], recommendation_type=match['recommendation_type'])

        for match_name in matches_to_remove:
            relation_worker.delete_match_recommend(user_id, match_name)
        relation_worker.close()

        return jsonify({'message': 'Successfully updated recommended matches'}), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Error while updating recommended matches'}), 500



#################
# Track user
#################
@app.route('/users/track', methods=['POST'])
def track_user():
    print('Tracking user')
    print('Request: ', request.json)
    event = request.json

    event_worker = Event_Worker()
    event_worker.create_event(event)

    return jsonify({'message': 'Successfully tracked user'}), 200

#################
# SocketIO events
#################
@socketio.on("connect")
def connected():
    """event listener when client connects to the server"""
    users.append(request.sid)
    print()
    print(request.sid, "client has connected\n")
    print("current users: ", users)
    emit("connect",{"data":f"id: {request.sid} is connected"})

@socketio.on('data')
def handle_message(data):
    """event listener when client types a message"""
    print("data from the front end: ",str(data))
    emit("data",{'data':data,'id':request.sid},broadcast=True)

@socketio.on("disconnect")
def disconnected():
    """event listener when client disconnects to the server"""
    users.remove(request.sid)
    print("user disconnected")
    emit("disconnect",f"user {request.sid} disconnected",broadcast=True)

@socketio.on("create_group")
def handle_create_room(data):
    print(f"\n{data}\n")
    group_id = data['group_id']
    group_name = data['group_name']
    user_id = data['user_id']

    # Neo4j create group
    neo4j_worker = User_Worker()
    # Check if the user is already in the group
    # if neo4j_worker.group_exists(group_name):
    #     print("Group exists")
    neo4j_worker.create_group(group_id=group_id, group_name=group_name)
    neo4j_worker.add_user_to_group(user_id=user_id, group_id=group_id, creator=True)
    #     group_id = neo4j_worker.get_group_id(group_name)
    # else:
        # TODO emit that this group does not exist
        # print("Group does not exist")
        # group_id = str(uuid.uuid4())
        # neo4j_worker.create_group(group_name, group_id)
        # neo4j_worker.add_user_to_group(user_id=user_id, group_name=group_name)

    # Add the user to the socket IO room (for sending messages to the group)
    print("Joining room:", group_name, group_id)
    join_room(group_id)

    users = neo4j_worker.get_users_by_group(group_id)
    print(f"\nUsers in the group are: {users}\n")
    neo4j_worker.close()

    emit("update_group_users", users, room=group_id, broadcast=True)

@socketio.on("join_group")
def handle_join_room(data):
    print(f"\n{data}\n")
    group_id = data['group_id']
    user_id = data['user_id']

    # Neo4j create group
    try:
        neo4j_worker = User_Worker()
        neo4j_worker.add_user_to_group(user_id=user_id, group_id=group_id, creator=False)

        # Add the user to the socket IO room (for sending messages to the group)
        print("Joining room:", group_id)
        join_room(group_id)

        users = neo4j_worker.get_users_by_group(group_id)
        print(f"\nUsers in the group are: {users}\n")
        neo4j_worker.close()
        emit('join_group_status', {'success': 'Success'}, room=request.sid)
    except:
        print('Error: invalid group ID. Make sure it\'s the correct ID.')
        emit('join_group_status', {'error': "Error: invalid group ID. Make sure it's the correct ID."}, room=request.sid)

@socketio.on("leave_group")
def handle_leave_room(data):
    group_id = data['group_id']
    user_id = data['user']['user_id']
    
    print(f"\nTriggered leave group for {user_id} from {group_id}\n")
    
    neo4j_worker = User_Worker()
    neo4j_worker.remove_user_from_group(user_id, group_id)
    neo4j_worker.close()

    emit("update_group_users", users, room=group_id, broadcast=True)

    # Must be at the end of the logic to get the last update
    leave_room(group_id)

if __name__ == '__main__':
    host = os.environ.get("BACKEND_HOST", "0.0.0.0") # get from environment, if not present, use second value
    port = int(os.environ.get("BACKEND_PORT", "5001"))
    socketio.run(app, host="0.0.0.0", port=port, debug=True)
