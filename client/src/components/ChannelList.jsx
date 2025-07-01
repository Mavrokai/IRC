import React, { useRef, useState } from "react";

export default function ChannelList({
  channels,
  currentChannel,
  onJoin,
  onLeave,
  onDelete,
  onCreate,
  onRename,
  userChannels = new Set(),
  login = "",
  unreadCounts = {},
}) {
  const [newChannel, setNewChannel] = useState("");
  const [editing, setEditing] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dropdownRef = useRef();

  React.useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(null);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const joinedChannels = channels.filter((c) => userChannels.has(c.name));

  return (
    <>
      <div style={{ marginBottom: 10, fontSize: "0.95rem", color: "#ff6961" }}>
        <b>Channels rejoints :</b>
        {joinedChannels.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {joinedChannels.map((c) => (
              <li
                key={"joined-" + c.name}
                style={{
                  fontWeight: c.name === currentChannel ? "bold" : "normal",
                }}
              >
                {c.name}
              </li>
            ))}
          </ul>
        ) : (
          <span> Aucun</span>
        )}
      </div>
      <ul className="channel-list">
        {channels.map((channel) => {
          const isMember = userChannels.has(channel.name);
          const isCreator = channel.creator === login;
          return (
            <li
              key={"channel-" + channel.name}
              className={
                "channel-item" +
                (channel.name === currentChannel ? " active" : "")
              }
            >
              {editing === channel.name ? (
                <>
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    style={{ marginRight: 8 }}
                  />
                  <button
                    className="btn-small btn-primary"
                    onClick={() => {
                      onRename(channel.name, renameValue);
                      setEditing(null);
                    }}
                  >
                    Valider
                  </button>
                  <button
                    className="btn-small"
                    onClick={() => setEditing(null)}
                  >
                    Annuler
                  </button>
                </>
              ) : (
                <>
                  <span onClick={() => onJoin(channel.name)}>
                    {channel.name}
                  </span>
                  {unreadCounts[channel.name] > 0 && (
                    <span
                      style={{
                        background: "#ff6961",
                        color: "#fff",
                        borderRadius: 12,
                        padding: "2px 8px",
                        fontSize: "0.85em",
                        marginLeft: 8,
                        fontWeight: "bold",
                        boxShadow: "1px 2px 0 #b2f7ef",
                        verticalAlign: "middle",
                      }}
                    >
                      {unreadCounts[channel.name]}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: "0.8em",
                      color: "#b2b2b2",
                      marginLeft: 8,
                    }}
                  >
                    {channel.creator ? `(créé par ${channel.creator})` : ""}
                  </span>
                </>
              )}
              <div className="channel-actions" style={{ position: "relative" }}>
                {!isMember ? (
                  <button
                    className="btn-small btn-join"
                    onClick={() => onJoin(channel.name)}
                    disabled={isMember}
                  >
                    Rejoindre
                  </button>
                ) : (
                  <>
                    <button
                      className="btn-small btn-dropdown"
                      onClick={() =>
                        setDropdownOpen(
                          dropdownOpen === channel.name ? null : channel.name
                        )
                      }
                      aria-label="Actions channel"
                      style={{ fontSize: 20, padding: "2px 10px" }}
                    >
                      ⋮
                    </button>
                    {dropdownOpen === channel.name && (
                      <ul
                        className="dropdown-menu"
                        ref={dropdownRef}
                        style={{
                          position: "absolute",
                          top: 32,
                          right: 0,
                          background: "#fffbe7",
                          border: "2px solid #ffb347",
                          borderRadius: 10,
                          boxShadow: "2px 4px 0 #b2f7ef",
                          zIndex: 20,
                          listStyle: "none",
                          margin: 0,
                          padding: "6px 0",
                          minWidth: 120,
                        }}
                      >
                        <li>
                          <button
                            className="btn-small btn-leave"
                            onClick={() => {
                              onLeave(channel.name);
                              setDropdownOpen(null);
                            }}
                            style={{ width: "100%", textAlign: "left" }}
                          >
                            Quitter
                          </button>
                        </li>
                        {isCreator && channel.name !== "Général" && (
                          <>
                            <li>
                              <button
                                className="btn-small btn-danger"
                                onClick={() => {
                                  onDelete(channel.name);
                                  setDropdownOpen(null);
                                }}
                                style={{ width: "100%", textAlign: "left" }}
                              >
                                Supprimer
                              </button>
                            </li>
                            <li>
                              <button
                                className="btn-small"
                                onClick={() => {
                                  setEditing(channel.name);
                                  setRenameValue(channel.name);
                                  setDropdownOpen(null);
                                }}
                                style={{ width: "100%", textAlign: "left" }}
                              >
                                Modifier
                              </button>
                            </li>
                          </>
                        )}
                      </ul>
                    )}
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="channel-controls">
        <input
          type="text"
          className="channel-input"
          placeholder="Nouveau channel"
          value={newChannel}
          onChange={(e) => setNewChannel(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={() => {
            onCreate(newChannel);
            setNewChannel("");
          }}
        >
          Créer
        </button>
      </div>
    </>
  );
}
