import React, { useRef, useState } from "react";

export default function ProfileModal({ login, avatar, onClose, onSave }) {
  const [newLogin, setNewLogin] = useState(login);
  const [newAvatar, setNewAvatar] = useState(avatar);
  const fileInput = useRef();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewAvatar(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal">
        <h2>Modifier le profil</h2>
        <div className="profile-avatar-container">
          <img
            src={
              newAvatar ||
              "https://api.dicebear.com/7.x/bottts/svg?seed=" + newLogin
            }
            alt="avatar"
            className="profile-avatar"
          />
        </div>
        <input
          type="file"
          accept="image/*"
          className="profile-avatar-input"
          ref={fileInput}
          onChange={handleAvatarChange}
        />
        <button
          className="btn btn-primary"
          onClick={() => fileInput.current.click()}
        >
          Modifier l'avatar
        </button>
        <div className="profile-form-group">
          <label className="profile-label">Pseudo :</label>
          <input
            className="profile-input"
            value={newLogin}
            onChange={(e) => setNewLogin(e.target.value)}
          />
        </div>
        <div className="profile-actions">
          <button
            className="btn btn-primary"
            onClick={() => onSave(newLogin, newAvatar)}
          >
            Valider
          </button>
          <button className="btn" onClick={onClose}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}