import { useEffect, useState, useRef } from "react";

export default function Room({ onRoomSelected }) {
  const [chatName, setChatName] = useState("");
  const chatNameInput = useRef();

  const handleChatEntry = (e) => {
    e.preventDefault();
    const newChatName = chatNameInput.current.value;
    setChatName(newChatName);
    localStorage.setItem("chatName", newChatName);
    console.log("chatName", newChatName);
    onRoomSelected(newChatName);
  };

  return (
    <>
      <h2 className="http">{chatName ? `Current Room: ${chatName}` : "No room selected"}</h2>
      <form className="chat-entry-form" onSubmit={handleChatEntry}>
        <h3 className="chat-entry">Choose a chat to enter</h3>
        <label htmlFor="chatName">Chat Name</label>
        <input
          type="text"
          id="chatName"
          name="chatName"
          ref={chatNameInput}
        />
        <button type="submit" onSubmit={setChatName}>Enter Chat</button>
      </form>
    </>
  );
}
