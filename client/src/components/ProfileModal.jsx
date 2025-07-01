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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.3)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fffbe7",
          borderRadius: 20,
          padding: 32,
          minWidth: 320,
          boxShadow: "0 8px 32px #0002",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#ff6961" }}>
          Modifier le profil
        </h2>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <img
            src={
              newAvatar ||
              "https://api.dicebear.com/7.x/bottts/svg?seed=" + newLogin
            }
            alt="avatar"
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: "2px solid #b2f7ef",
              objectFit: "cover",
            }}
          />
        </div>
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={fileInput}
          onChange={handleAvatarChange}
        />
        <button
          className="btn"
          onClick={() => fileInput.current.click()}
          style={{ marginBottom: 16 }}
        >
          Modifier l'avatar
        </button>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: "bold", color: "#ff6961" }}>
            Pseudo&nbsp;:
          </label>
          <input
            value={newLogin}
            onChange={(e) => setNewLogin(e.target.value)}
            style={{
              marginLeft: 8,
              padding: 6,
              borderRadius: 8,
              border: "1px solid #b2f7ef",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
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
