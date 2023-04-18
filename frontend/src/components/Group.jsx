import { useState, useRef } from "react";

export default function Group({ onGroupSelected, onGroupLeft, user }) {
  const [chatName, setChatName] = useState("");
  const chatNameInput = useRef();

  const handleChatEntry = (e) => {
    e.preventDefault();
    const newChatName = chatNameInput.current.value;
    setChatName(newChatName);
    localStorage.setItem("chatName", newChatName);
    console.log("chatName", newChatName);
    onGroupSelected(newChatName, user);
  };

  const handleGroupLeave = () => {
    setChatName("");
    onGroupLeft();
  };

  return (
    <div>
      <h2 className="http">{chatName ? `Current Group: ${chatName}` : "No group selected"}</h2>
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
      {chatName && <button onClick={handleGroupLeave}>Leave Group</button>}
    </div>
  );
}
