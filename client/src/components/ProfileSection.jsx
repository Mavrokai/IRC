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
    <div style={{ marginBottom: 24, textAlign: "center" }}>
      <div style={{ marginBottom: 8 }}>
        <img
          src={
            avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=" + login
          }
          alt="avatar"
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            border: "2px solid #b2f7ef",
            objectFit: "cover",
          }}
        />
      </div>
      <button
        className="btn"
        onClick={() => setModalOpen(true)}
        style={{ marginBottom: 8 }}
      >
        <span role="img" aria-label="edit">
          ✏️
        </span>{" "}
        Editer le profil
      </button>
      <div>
        <span style={{ fontWeight: "bold", fontSize: "1.1em" }}>{login}</span>
      </div>
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
