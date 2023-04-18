from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from engineio.payload import Payload
import os
from Neo4j_Worker import App
import uuid

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

    neo4j_worker = App()
    user = neo4j_worker.create_user(name, user_id, email)
    neo4j_worker.close()

    return jsonify(user), 201

@app.route("/users/<user_id>", methods=["GET"])
def get_user(user_id):
    print(user_id)
    neo4j_worker = App()
    user = neo4j_worker.get_user(user_id)
    neo4j_worker.close()

    return jsonify(user), 200


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

    # May or may not be necessary
    # Find room that the user was in and remove them from the room
    room_to_leave = None
    for room, users_list in room_users.items():
        if request.sid in users_list:
            room_to_leave = room
            break

    if room_to_leave:
        handle_leave_room(room_to_leave)  # Trigger the leave_room event

# TODO send list of users in group from Neo4j to front end

@socketio.on("join_group")
def handle_join_room(data):
    print()
    print(data)
    print()
    group_name = data['group']
    group_id = str(uuid.uuid4())
    name = data['user']['name']
    user_id = data['user']['user_id']

    # Neo4j join group
    neo4j_worker = App()
    neo4j_worker.create_group(group_name, group_id)
    neo4j_worker.add_user_to_group(user_id=user_id, group_id=group_id)
    neo4j_worker.close()

    # TODO Get list of users in group from Neo4j, send to front end
    emit("update_room_users", [], room=group_id, broadcast=True)

@socketio.on("leave_group")
def handle_leave_room(data):
    # TODO Neo4j leave group
    group = data['group']
    user_name = data['user_name']
    user_sid = request.sid
    leave_room(group)
    if group in room_users:
        room_users[group] = [user for user in room_users[group] if user["sid"] != user_sid]
        if not room_users[group]:
            del room_users[group]  # remove room if no users
    print(f"{user_name} has left room {group}")
    print(f"room_users: {room_users}")
    emit("update_room_users", room_users.get(group, []), room=group, broadcast=True)


if __name__ == '__main__':
    host = os.environ.get("BACKEND_HOST", "0.0.0.0") # get from environment, if not present, use second value
    port = int(os.environ.get("BACKEND_PORT", "5001"))
    socketio.run(app, host="0.0.0.0", port=port, debug=True)
