from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO

import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

users = {}

@socketio.on('disconnect')
def on_disconnect():
    users.pop(request.sid, 'No user found')
    socketio.emit('current_users', users)
    print("Users disconnected!\nUsers are: ", users)

@socketio.on('connect')
def on_connect(user_name, methods=['GET', 'POST']):
    users[request.sid] = user_name['name']
    socketio.emit('current_users', users)
    print("User connected!\nUsers are: ", users)

@socketio.on('message')
def on_message(message, methods=['GET', 'POST']):
    print("Message received!\nMessage is: ", message)
    message['from'] = request.sid
    socketio.emit('message', message, room=request.sid)
    socketio.emit('message', message, room=message['to'])

if __name__ == '__main__':
    socketio.run(app, debug=True)