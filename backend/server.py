from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from engineio.payload import Payload
import os

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

@socketio.on("join_room")
def handle_join_room(data):
    room = data['room']
    user_name = data['user_name']
    join_room(room)
    if room not in room_users:
        room_users[room] = []
    room_users[room].append({"sid": request.sid, "name": user_name})
    print(f"{request.sid} has joined room {room}")
    print(f"room_users: {room_users}")
    emit("update_room_users", room_users[room], room=room, broadcast=True)

@socketio.on("leave_room")
def handle_leave_room(data):
    room = data['room']
    user_name = data['user_name']
    user_sid = request.sid
    leave_room(room)
    if room in room_users:
        room_users[room] = [user for user in room_users[room] if user["sid"] != user_sid]
        if not room_users[room]:
            del room_users[room]  # remove room if no users
    print(f"{user_name} has left room {room}")
    print(f"room_users: {room_users}")
    emit("update_room_users", room_users.get(room, []), room=room, broadcast=True)


if __name__ == '__main__':
    host = os.environ.get("BACKEND_HOST", "0.0.0.0") # get from environment, if not present, use second value
    port = int(os.environ.get("BACKEND_PORT", "5001"))
    socketio.run(app, host="0.0.0.0", port=port, debug=True)
