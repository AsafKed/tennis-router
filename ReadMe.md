# Simple ReactJS + Flask App using WebSockets (socket.io)
## Running the services individually
The backend and frontend use sockets to communicate. This makes it so that updates (to group members, for example) are instantly accessible to all users of the relevant data. 

For this to work, the backend must run before the frontend. 

1. Navigate to the backend directory
2. Run `python3 server.py` (on Linux)
3. Navigate to the frontend directory
4. Run `npm run start`

## Running the services using Docker
Locally, in the main directory, run this command:
> docker compose -f docker-compose.dev.yml up -d

In production (on an online server, such as Ubuntu 22.04), run this command:
> docker compose -f docker-compose.prod.yml up -d

This is recommended especially for use in the server. Before pushing changes, however, ensure that running them with Docker works locally.

## Running on a server
It's set up using Nginx on an Ubuntu 22 server. The docker-compose.yml file should have 2 changes when on the server: instead of having
> build: ./backend
That line should say:
> image: musashishi/backend:latest
This pulls it from the Docker Hub, which means the server doesn't need to spend resources to build the docker image. The same thing should be done for the frontend.

## Tech Stack

**Client:** ReactJS,socket.io,socket.io-client

**Server:** Python3,eventlet,Flask-Cors,Flask-SocketIO

## Installation

Make sure you have installed Node.js, npm, Python3, and pip.
After installation please follow the instructions below to download the repo.

- Within the terminal window, create a folder in your local drive.
- Navigate to the folder created.
- Run the following command:

```bash
  git clone https://github.com/adrianhuber17/webSocket-App.git
```

- Navigate into the new sub-folder created called **WebSocket-App**.
- Run the following commands to create an environment and install the dependencies:

```bash
  python3 -m venv env
  source env/bin/activate
  pip install -r requirements.txt
```

- Navigate into the /**front-end** folder and run the following command:

```bash
  npm i react-scripts
```

## Run Locally

Open two terminal windows, one to be used by the Flask server and the other
to be used by the React client.
Make sure the server is initialized before the client to avoid any issues.

Terminal **window 1** - start the server:

```bash
  cd webSocket-App
  source env/bin/activate
  python3 server.py
```

Terminal **window 2** - start the client:

```bash
  cd webSocket-App/front-end
  npm start
```

## Demo

The browser on the left is Google Chrome and the Browser on the right is Firefox.
The demo below displays in **red** a simple fetch to the server that executes on the rendering of the page using an http call.
It also displays a chat communication between two users in the server using WebSocket communication. Notice that when a message is sent by one
user, the other user receives the message without having to re-render the component or the page.

![](/applicationDemo.gif)

You will notice in the code that I manually set Flask to run on PORT 5001 instead of the usual PORT 5000.
This is because AirPlay in Apple is also running on PORT 5000 and it was making it difficult for Flask and React to connect
using WebSockets.
Another workaround is to turn off Airplay on the Mac by going to System Preferences > Sharing > uncheck AirPlay Receiver.