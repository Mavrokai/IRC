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
      <div className="channels-joined">
        <b>Channels rejoints :</b>
        {joinedChannels.length > 0 ? (
          <ul className="channels-joined-list">
            {joinedChannels.map((c) => (
              <li
                key={"joined-" + c.name}
                className={
                  "channels-joined-item" +
                  (c.name === currentChannel ? " active" : "")
                }
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
                    className="channel-rename-input"
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
                  <span
                    className="channel-name"
                    onClick={() => onJoin(channel.name)}
                  >
                    {channel.name}
                  </span>
                  {unreadCounts[channel.name] > 0 && (
                    <span className="unread-badge">
                      {unreadCounts[channel.name]}
                    </span>
                  )}
                  <span className="channel-creator">
                    {channel.creator ? `(créé par ${channel.creator})` : ""}
                  </span>
                </>
              )}
              <div className="channel-actions-wrapper">
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
                    >
                      ⋮
                    </button>
                    {dropdownOpen === channel.name && (
                      <ul
                        className="dropdown-menu channel-dropdown-menu"
                        ref={dropdownRef}
                      >
                        <li>
                          <button
                            className="btn-small btn-leave"
                            onClick={() => {
                              onLeave(channel.name);
                              setDropdownOpen(null);
                            }}
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
