import React from "react";

export default function ChannelList({ channels, currentChannel, onJoin }) {
  return (
    <div>
      <h3>Channels</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {channels.map((channel) => (
          <li
            key={channel.name || channel}
            onClick={() => onJoin(channel.name || channel)}
            style={{
              padding: "8px 12px",
              margin: "4px 0",
              background: currentChannel === (channel.name || channel) ? "#40444b" : "transparent",
              borderRadius: "4px",
              cursor: "pointer",
              color: "#dcddde"
            }}
          >
            # {channel.name || channel}
          </li>
        ))}
      </ul>
    </div>
  );
}