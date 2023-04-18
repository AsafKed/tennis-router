import { useEffect, useState } from "react";

export default function UserList({ socket, group, user }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [groupUsers, setGroupUsers] = useState([]);

  const handleText = (e) => {
    const inputMessage = e.target.value;
    setMessage(inputMessage);
  };

  const handleSubmit = () => {
    if (!message) {
      return;
    }
    socket.emit("data", { message, group });
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
    if (group) {
      socket.emit("join_group", { group, user: user });
    }

    socket.on("update_group_users", (users) => {
      setGroupUsers(users);
    });

    // This ensures that if a window is closed, the user is removed from the group. May not be necessary.
    window.addEventListener("beforeunload", () => {
      if (group) {
        socket.emit("leave_group", group);
      }
    });

    return () => {
      if (group) {
        socket.emit("leave_group", { group, user: user });
      }
      socket.off("update_group_users");
    };
  }, [socket, group, user]);

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
        <h3>Users in group</h3>
        <ul>
          {groupUsers.map((user, ind) => {
            return <li key={ind}>{user.name}</li>;
          })}
        </ul>
      </div>
    </div>
  );
}
