
import React from "react";

export default function ChatWindow({ messages }) {
  return (
    <div style={{
      flex: 1,
      padding: "20px",
      overflowY: "auto",
      background: "#36393f"
    }}>
      {messages.map((msg, i) => (
        <div key={i} style={{ marginBottom: "10px" }}>
          <strong>{msg.user}</strong>: {msg.message}
          <small style={{ color: "#72767d", marginLeft: "10px" }}>
            {msg.timestamp}
          </small>
        </div>
      ))}
    </div>
  );
}