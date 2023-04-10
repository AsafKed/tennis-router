import "./App.css";
import Room from "./components/Room";
import UserList from "./components/UserList";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

function App() {
  const [socketInstance, setSocketInstance] = useState("");
  const [loading, setLoading] = useState(true);
  const [buttonStatus, setButtonStatus] = useState(false);
  const [room, setRoom] = useState("");

  const handleClick = () => {
    if (buttonStatus === false) {
      setButtonStatus(true);
    } else {
      setButtonStatus(false);
    }
  };

  const handleRoomSelected = (roomName) => {
    setRoom(roomName);
  };

  useEffect(() => {
    if (buttonStatus === true) {
      const socket = io("localhost:5001/", {
        transports: ["websocket"],
        cors: {
          origin: "http://localhost:3000/",
        },
      });

      setSocketInstance(socket);

      socket.on("connect", (data) => {
        console.log(data);
      });

      setLoading(false);

      socket.on("disconnect", (data) => {
        console.log(data);
      });

      return function cleanup() {
        socket.disconnect();
      };
    }
  }, [buttonStatus]);

  return (
    <div className="App">
      <h1>React/Flask App + socket.io</h1>
      <div className="line">
        <Room onRoomSelected={handleRoomSelected} />
      </div>
      {!buttonStatus ? (
        <button onClick={handleClick}>turn chat on</button>
      ) : (
        <>
          <button onClick={handleClick}>turn chat off</button>
          <div className="line">
            {!loading && <UserList socket={socketInstance} room={room} />}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
