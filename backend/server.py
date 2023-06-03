from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from engineio.payload import Payload
import os
from database_workers.Neo4j_User_Worker import User_Worker
from database_workers.Neo4j_Player_Worker import Player_Worker
from database_workers.Neo4j_Relation_Worker import Relation_Worker
from database_workers.Neo4j_Similarity_Worker import Similarity_Worker
import uuid
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app,resources={r"/*":{"origins":"*"}})
Payload.max_decode_packets = 500
socketio = SocketIO(app, cors_allowed_origins="*")
socketio.init_app(app, cors_allowed_origins="*")

########################
# Initialized variables
########################
attribute_weights = {
    "rank": 1,
    "rank_points": 1,
    "win_count": 1,
    "loss_count": 1,
    "tournaments_played": 1,
    "win_percent": 1,
    "aces_avg": 1,
    "double_faults_avg": 1,
    "service_points_avg": 1,
    "first_serve_points_won_avg": 1,
    "second_serve_points_won_avg": 1,
    "serve_games_avg": 1,
    "break_points_saved_avg": 1,
    "break_points_faced_avg": 1
}

#################
# HTTP endpoints
#################
@app.route("/users")
def http_call():
    """return JSON with string data as the value"""
    data = {'data':users}
    return jsonify(data)

users = []
room_users = {}

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
    neo4j_worker = User_Worker()
    similarity_weights = neo4j_worker.get_similarity_weights(user_id)
    neo4j_worker.close()

    return jsonify(similarity_weights), 200

@app.route("/users/<user_id>/preferences", methods=["PUT"])
def update_user_preferences(user_id):
    preferences_data = request.json
    print(f"\nPreferences data {preferences_data}\n")
    # Update this in neo4j
    neo4j_worker = User_Worker()
    # TODO make these actual preferences
    preference1 = preferences_data["preference1"]
    preference2 = preferences_data["preference2"]
    sliderValue = preferences_data["sliderValue"]
    neo4j_worker.update_user_preferences(user_id, preference1, preference2, sliderValue)
    neo4j_worker.close()

    return jsonify(preferences_data), 201

@app.route("/users/<user_id>/settings", methods=["PUT"])
def update_user_settings(user_id):
    settings_data = request.json
    print(f"\nSettings data {settings_data}\n")
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
    user_id = query['user_id'][0]

    try:
        user_worker = User_Worker()
        weight = user_worker.get_similarity_weights(user_id)
        user_worker.close()

        sim_worker = Similarity_Worker()
        similar_players = sim_worker.get_top_similarities(player_name, weight)
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
        # Liking a player updates recommended players
        neo4j_worker = Relation_Worker()
        neo4j_worker.create_likes_relation(user_id, player_name)
        neo4j_worker.delete_recommend_relations(user_id)
        # similar_players = neo4j_worker.get_similar_players_based_on_attributes(user_id, attribute_weights)
        # neo4j_worker.create_recommend_relations(user_id, similar_players)
        neo4j_worker.close()
        return jsonify({'message': 'Successfully liked player and updated recommendations'}), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Error while liking player and updating recommendations'}), 500

# User unlikes player
@app.route('/players/unlike', methods=['POST'])
def unlike_player():
    global attribute_weights
    try:
        user_id = request.json['user_id']
        player_name = request.json['name']
        neo4j_worker = Relation_Worker()
        neo4j_worker.delete_likes_relation(user_id, player_name)
        neo4j_worker.delete_recommend_relations(user_id)
        # similar_players = neo4j_worker.get_similar_players_based_on_attributes(user_id, attribute_weights)
        # neo4j_worker.create_recommend_relations(user_id, similar_players)
        neo4j_worker.close()
        return jsonify({'message': 'Successfully unliked player and updated recommendations'}), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Error while unliking player and updating recommendations'}), 500

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
