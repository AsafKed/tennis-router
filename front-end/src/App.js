import "./App.css";
import Room from "./components/Room";
import UserList from "./components/UserList";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

function App() {
  const [socketInstance, setSocketInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState("");
  const [userName, setUserName] = useState("");

  const handleRoomSelected = (roomName, userName) => {
    setRoom(roomName);
    setUserName(userName);
  };

  useEffect(() => {
    if (!socketInstance) {
      const socket = io("http://localhost:5001/", {
        transports: ["websocket"],
        cors: {
          origin: "http://localhost:3000/",
        },
      });

      setSocketInstance(socket);

      socket.on("connect", (data) => {
        console.log(data);
      });

      socket.on("disconnect", (data) => {
        console.log(data);
      });
    }
  }, [socketInstance]);

  useEffect(() => {
    if (room && socketInstance) {
      setLoading(false);
    }
  }, [room, socketInstance]);

  return (
    <div className="App">
      <h1>React/Flask App + socket.io</h1>
      <div className="line">
        <Room onRoomSelected={handleRoomSelected} />
      </div>
      {!loading && <UserList socket={socketInstance} room={room} userName={userName} />}
    </div>
  );
}

export default App;