import React, { useState } from "react";
import ProfileModal from "./ProfileModal.jsx";

export default function ProfileSection({
  login,
  onChangeLogin,
  avatar,
  onChangeAvatar,
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleSave = (newLogin, newAvatar) => {
    onChangeLogin(newLogin);
    onChangeAvatar(newAvatar);
    setModalOpen(false);
  };

  return (
    <div className="profile-section">
      <img
        src={avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=" + login}
        alt="avatar"
        className="profile-section-avatar"
      />
      <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
        <span role="img" aria-label="edit">
          ✏️
        </span>{" "}
        Editer le profil
      </button>
      <span className="profile-section-username">{login}</span>
      {modalOpen && (
        <ProfileModal
          login={login}
          avatar={avatar}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
