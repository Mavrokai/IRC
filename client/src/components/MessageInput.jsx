import React, { useEffect, useRef, useState } from "react";

const COMMANDS = [
  "/nick",
  "/list",
  "/create",
  "/delete",
  "/join",
  "/leave",
  "/users",
  "/msg",
];

export default function MessageInput({ onSend, disabled }) {
  const [message, setMessage] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef();

  useEffect(() => {
    if (message.startsWith("/")) {
      const input = message.slice(1).toLowerCase();
      const filtered = COMMANDS.filter((cmd) => cmd.slice(1).startsWith(input));
      setFilteredCommands(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
    }
  }, [message]);

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      if (message.trim().startsWith("/")) {
        const parts = message.trim().slice(1).split(" ");
        const command = parts[0];
        const args = parts.slice(1);
        onSend({ command, args });
      } else {
        onSend(message.trim());
      }
      setMessage("");
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === "Tab" || e.key === "Enter") {
        if (filteredCommands.length > 0) {
          e.preventDefault();
          setMessage(filteredCommands[selectedIndex] + " ");
          setShowSuggestions(false);

          setTimeout(() => {
            textareaRef.current.selectionStart =
              textareaRef.current.value.length;
            textareaRef.current.selectionEnd = textareaRef.current.value.length;
          }, 0);
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    }
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <form
        className="input-container"
        onSubmit={handleSend}
        autoComplete="off"
      >
        <textarea
          className="message-input"
          placeholder="Tapez votre message..."
          rows={3}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          ref={textareaRef}
          autoComplete="off"
        />
        <button className="send-btn" type="submit" disabled={disabled}>
          Envoyer
        </button>
      </form>
      {showSuggestions && (
        <ul
          style={{
            position: "absolute",
            left: 0,
            bottom: "56px",
            background: "#fffbe7",
            border: "2px solid #ffb347",
            borderRadius: 10,
            boxShadow: "2px 4px 0 #b2f7ef",
            zIndex: 10,
            listStyle: "none",
            margin: 0,
            padding: "6px 0",
            minWidth: 180,
            fontFamily: "Fredoka One, cursive",
          }}
        >
          {filteredCommands.map((cmd, i) => (
            <li
              key={cmd}
              style={{
                padding: "6px 18px",
                background: i === selectedIndex ? "#ffb347" : "#fffbe7",
                color: i === selectedIndex ? "#fffbe7" : "#ff6961",
                cursor: "pointer",
                fontWeight: i === selectedIndex ? "bold" : "normal",
                borderRadius: 8,
              }}
              onMouseDown={() => {
                setMessage(cmd + " ");
                setShowSuggestions(false);
                setTimeout(() => {
                  textareaRef.current.focus();
                  textareaRef.current.selectionStart =
                    textareaRef.current.value.length;
                  textareaRef.current.selectionEnd =
                    textareaRef.current.value.length;
                }, 0);
              }}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              {cmd}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
