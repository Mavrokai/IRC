import React, { useEffect, useRef } from "react";

export default function ChatWindow({ messages }) {
  const containerRef = useRef(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="messages-container" ref={containerRef}>
      {messages.map((msg, i) => {
        if (!msg || typeof msg !== "object" || !msg.message) {
          return null;
        }

        return (
          <div
            key={i}
            className={
              "message" +
              (msg.isPrivate ? " private" : msg.system ? " system" : "")
            }
            style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
          >
            {msg.avatar && !msg.system ? (
              <img
                src={msg.avatar}
                alt="avatar"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "2px solid #b2f7ef",
                  objectFit: "cover",
                  marginRight: 8,
                }}
              />
            ) : (
              !msg.system && (
                <img
                  src={
                    "https://api.dicebear.com/7.x/bottts/svg?seed=" +
                    (msg.user || msg.from || "user")
                  }
                  alt="avatar"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "2px solid #b2f7ef",
                    objectFit: "cover",
                    marginRight: 8,
                  }}
                />
              )
            )}
            <div style={{ flex: 1 }}>
              <div className="message-header">
                {msg.isPrivate ? (
                  <span className="message-user">
                    {msg.from} → {msg.to} (privé)
                  </span>
                ) : (
                  <span className="message-user">{msg.user}</span>
                )}
                <span className="message-time">{msg.timestamp}</span>
              </div>
              <div className="message-content">{msg.message}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}