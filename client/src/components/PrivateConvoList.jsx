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
        <ul className="private-convos-list">
          {(privateConversations || []).map((pseudo) => (
            <li
              key={pseudo}
              className={`private-convo-item ${
                selectedPrivate === pseudo ? "active" : ""
              }`}
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