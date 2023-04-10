from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app,resources={r"/*":{"origins":"*"}})
socketio = SocketIO(app,cors_allowed_origins="*")

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

@socketio.on("join_room")
def handle_join_room(room):
    join_room(room)
    if room not in room_users:
        room_users[room] = []
    room_users[room].append(request.sid)
    print(f"{request.sid} has joined room {room}")
    print(f"room_users: {room_users}")
    emit("update_room_users", room_users[room], room=room)

@socketio.on("leave_room")
def handle_leave_room(room):
    leave_room(room)
    if room in room_users:
        room_users[room].remove(request.sid)
        if not room_users[room]:
            del room_users[room] # remove room if no users
    print(f"{request.sid} has left room {room}")
    print(f"room_users: {room_users}")
    emit("update_room_users", room_users.get(room, []), room=room)

if __name__ == '__main__':
    socketio.run(app, debug=True,port=5001)
