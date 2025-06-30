import React, { useState } from "react";

export default function LoginModal({ onLogin }) {
  const [login, setLogin] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login.trim()) {
      onLogin(login.trim());
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <form onSubmit={handleSubmit} style={{
        background: "white",
        padding: "30px",
        borderRadius: "10px",
        textAlign: "center"
      }}>
        <h2>Connexion au Chat IRC</h2>
        <input
          type="text"
          placeholder="Votre pseudo"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          style={{
            padding: "10px",
            margin: "10px 0",
            width: "200px",
            borderRadius: "5px",
            border: "1px solid #ccc"
          }}
        />
        <br />
        <button type="submit" style={{
          padding: "10px 20px",
          background: "#7289da",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}>
          Se connecter
        </button>
      </form>
    </div>
  );
}