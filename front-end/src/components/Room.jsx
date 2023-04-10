import { useState, useRef } from "react";

export default function Room({ onRoomSelected, onRoomLeft }) {
  const [chatName, setChatName] = useState("");
  const chatNameInput = useRef();
  const userNameInput = useRef();

  const handleChatEntry = (e) => {
    e.preventDefault();
    const newChatName = chatNameInput.current.value;
    const newUserName = userNameInput.current.value;
    setChatName(newChatName);
    localStorage.setItem("chatName", newChatName);
    localStorage.setItem("userName", newUserName);
    console.log("chatName", newChatName);
    console.log("userName", newUserName);
    onRoomSelected(newChatName, newUserName);
  };

  const handleRoomLeave = () => {
    setChatName("");
    onRoomLeft();
  };

  return (
    <>
      <h2 className="http">{chatName ? `Current Room: ${chatName}` : "No room selected"}</h2>
      <form className="chat-entry-form" onSubmit={handleChatEntry}>
        <h3 className="chat-entry">Choose a chat to enter</h3>
        <label htmlFor="userName">User Name</label>
        <input
          type="text"
          id="userName"
          name="userName"
          ref={userNameInput}
        />
        <br />
        <label htmlFor="chatName">Chat Name</label>
        <input
          type="text"
          id="chatName"
          name="chatName"
          ref={chatNameInput}
        />
        <button type="submit" onSubmit={setChatName}>Enter Chat</button>
      </form>
      {chatName && <button onClick={handleRoomLeave}>Leave Room</button>}
    </>
  );
}
