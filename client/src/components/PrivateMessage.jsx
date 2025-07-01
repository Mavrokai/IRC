import React, { useState } from "react";

export default function PrivateMessage({ users, onSend, disabled }) {
  const [target, setTarget] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (target && message.trim()) {
      onSend(target, message.trim());
      setMessage("");
    }
  };

  return (
    <form className="private-input-container" onSubmit={handleSend}>
      <select
        className="private-user-select"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        disabled={disabled}
      >
        <option value="">Sélectionnez un utilisateur</option>
        {users.map((user) => (
          <option key={user} value={user}>
            {user}
          </option>
        ))}
      </select>
      <input
        className="message-input"
        placeholder="Message privé..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={disabled}
      />
      <button className="send-btn" type="submit" disabled={disabled}>
        Envoyer
      </button>
    </form>
  );
}
