from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from engineio.payload import Payload
import os
from database_workers.Neo4j_User_Worker import User_Worker
from database_workers.Neo4j_Player_Worker import Player_Worker
from database_workers.Neo4j_Relation_Worker import Relation_Worker
import uuid
from database_workers.Neo4j_Helpers import user_in_group, get_group_id
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app,resources={r"/*":{"origins":"*"}})
Payload.max_decode_packets = 500
socketio = SocketIO(app, cors_allowed_origins="*")
socketio.init_app(app, cors_allowed_origins="*")

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
    neo4j_worker = User_Worker()
    groups = neo4j_worker.get_groups_by_user(user_id)
    neo4j_worker.close()

    return jsonify(groups), 200

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
        return json.dumps(players_list), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Error while getting players'}), 500

# User likes player
@app.route('/players/like', methods=['POST'])
def like_player():
    try:
        user_id = request.json['user_id']
        player_id = request.json['player_id']
        # Liking a player updates recommended players
        neo4j_worker = Relation_Worker()
        neo4j_worker.create_likes_relation(user_id, player_id)
        neo4j_worker.delete_recommend_relations(user_id)
        similar_players = neo4j_worker.get_similar_players(user_id)
        neo4j_worker.create_recommend_relations(user_id, similar_players)
        neo4j_worker.close()
        return jsonify({'message': 'Successfully liked player and updated recommendations'}), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Error while liking player and updating recommendations'}), 500


# User unlikes player
@app.route('/players/unlike', methods=['POST'])
def unlike_player():
    try:
        user_id = request.json['user_id']
        player_id = request.json['player_id']
        neo4j_worker = Relation_Worker()
        neo4j_worker.delete_likes_relation(user_id, player_id)
        neo4j_worker.delete_recommend_relations(user_id)
        similar_players = neo4j_worker.get_similar_players(user_id)
        neo4j_worker.create_recommend_relations(user_id, similar_players)
        neo4j_worker.close()
        return jsonify({'message': 'Successfully unliked player and updated recommendations'}), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Error while unliking player and updating recommendations'}), 500

# TODO add dislike player

# Get liked players
@app.route('/players/liked/<user_id>', methods=['GET'])
def get_liked_players(user_id):
    print(f'Getting liked players for user {user_id}')
    try:
        neo4j_worker = Relation_Worker()
        liked_players = neo4j_worker.get_liked_players(user_id)
        neo4j_worker.close()
        return json.dumps(liked_players), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Error while getting liked players'}), 500
    
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

@socketio.on("join_group")
def handle_join_room(data):
    print(f"\n{data}\n")
    group_name = data['group']
    user_id = data['user']['user_id']

    # Neo4j join group
    neo4j_worker = User_Worker()
    # TODO current logic is to create a new group FOR EACH USER, that's DUMB DUDE, ez fixy
    # Check if the user is already in the group
    if neo4j_worker.group_exists(group_name):
        print("Group exists")
        neo4j_worker.add_user_to_group(user_id=user_id, group_name=group_name)
        group_id = neo4j_worker.get_group_id(group_name)
    else:
        print("Group does not exist")
        group_id = str(uuid.uuid4())
        neo4j_worker.create_group(group_name, group_id)
        neo4j_worker.add_user_to_group(user_id=user_id, group_name=group_name)

    # Add the user to the socket IO room (for sending messages to the group)
    print("Joining room:", group_name, group_id)
    join_room(group_id)

    users = neo4j_worker.get_users_by_group(group_id)
    print(f"\nUsers in the group are: {users}\n")
    neo4j_worker.close()

    emit("update_group_users", users, room=group_id, broadcast=True)

@socketio.on("leave_group")
def handle_leave_room(data):
    group_name = data['group']
    user_id = data['user']['user_id']
    
    print(f"\nTriggered leave group for {user_id} from {group_name}\n")
    
    neo4j_worker = User_Worker()
    neo4j_worker.remove_user_from_group(user_id, group_name)
    group_id = neo4j_worker.get_group_id(group_name)
    users = neo4j_worker.get_users_by_group(group_id)
    neo4j_worker.close()

    emit("update_group_users", users, room=group_id, broadcast=True)

    # Must be at the end of the logic to get the last update
    leave_room(group_id)

if __name__ == '__main__':
    host = os.environ.get("BACKEND_HOST", "0.0.0.0") # get from environment, if not present, use second value
    port = int(os.environ.get("BACKEND_PORT", "5001"))
    socketio.run(app, host="0.0.0.0", port=port, debug=True)
