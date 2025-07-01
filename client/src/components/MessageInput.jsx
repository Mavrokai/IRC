import React, { useState } from "react";

export default function MessageInput({ onSend, disabled }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      padding: "20px",
      background: "#40444b",
      display: "flex",
      gap: "10px"
    }}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Tapez votre message..."
        disabled={disabled}
        style={{
          flex: 1,
          padding: "10px",
          borderRadius: "5px",
          border: "none",
          background: "#40444b",
          color: "white"
        }}
      />
      <button type="submit" disabled={disabled} style={{
        padding: "10px 20px",
        background: "#7289da",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: disabled ? "not-allowed" : "pointer"
      }}>
        Envoyer
      </button>
    </form>
  );
}