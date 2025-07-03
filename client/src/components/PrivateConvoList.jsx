import React from "react";

export default function PrivateConvoList({
  privateConversations,
  selectedPrivate,
  onSelect,
}) {
  return (
    <aside className="private-convos">
      <div className="private-convos-section">
        <h3>Conversations privées</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {(privateConversations || []).map((pseudo) => (
            <li
              key={pseudo}
              style={{
                padding: "10px 8px",
                margin: "6px 0",
                borderRadius: "20px 8px 20px 8px/8px 20px 8px 20px",
                background: selectedPrivate === pseudo ? "#ffb347" : "#fffbe7",
                color: selectedPrivate === pseudo ? "#fffbe7" : "#ff6961",
                fontWeight: "bold",
                fontSize: "1rem",
                boxShadow: "1px 2px 0 #b2f7ef",
                cursor: "pointer",
                border: "2px solid #b2f7ef",
                transition: "all 0.2s",
              }}
              onClick={() => onSelect(pseudo)}
            >
              {pseudo}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
