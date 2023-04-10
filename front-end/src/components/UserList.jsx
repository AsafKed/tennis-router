import { useEffect, useState } from "react";

export default function UserList({ socket, room }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);

  const handleText = (e) => {
    const inputMessage = e.target.value;
    setMessage(inputMessage);
  };

  const handleSubmit = () => {
    if (!message) {
      return;
    }
    socket.emit("data", { message, room });
    setMessage("");
  };

  useEffect(() => {
    socket.on("data", (data) => {
      setMessages([...messages, data.data]);
    });
    return () => {
      socket.off("data", () => {
        console.log("data event was removed");
      });
    };
  }, [socket, messages]);

  useEffect(() => {
    if (room) {
      socket.emit("join_room", room);
    }

    socket.on("update_room_users", (users) => {
      setRoomUsers(users);
    });

    // This ensures that if a window is closed, the user is removed from the room. May not be necessary.
    window.addEventListener("beforeunload", () => {
      if (room) {
        socket.emit("leave_room", room);
      }
    });

    return () => {
      if (room) {
        socket.emit("leave_room", room);
      }
      socket.off("update_room_users");
    };
  }, [socket, room]);

  return (
    <div>
      <h2>WebSocket Communication</h2>
      <input type="text" value={message} onChange={handleText} />
      <button onClick={handleSubmit}>submit</button>
      <ul>
        {messages.map((message, ind) => {
          return <li key={ind}>{message}</li>;
        })}
      </ul>
      <div>
        <h3>Users in room</h3>
        <ul>
          {roomUsers.map((user, ind) => {
            return <li key={ind}>{user}</li>;
          })}
        </ul>
      </div>
    </div>
  );
}
