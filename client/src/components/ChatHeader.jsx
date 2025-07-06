import React from "react";

export default function ChatHeader({
  selectedPrivate,
  currentChannel,
  channelMembers,
  onBack,
  login,
}) {
  return (
    <div className="chat-header">
      <div>
        <div className="current-channel">
          {selectedPrivate
            ? `Conversation privée avec ${selectedPrivate}`
            : currentChannel || "Aucun channel choisi/connecté"}
        </div>
        <div className="channel-members">
          {selectedPrivate
            ? null
            : `Membres: ${currentChannel ? channelMembers.length : 0}`}
        </div>
      </div>
      {selectedPrivate && (
        <button className="btn btn-primary" onClick={onBack}>
          Revenir au channel
        </button>
      )}
    </div>
  );
}