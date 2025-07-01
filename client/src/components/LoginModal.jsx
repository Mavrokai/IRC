import React, { useState } from "react";

export default function LoginModal({ onLogin }) {
  const [login, setLogin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login.trim().length < 2) {
      setError("Le nom d'utilisateur doit contenir au moins 2 caractères");
      return;
    }
    setError("");
    onLogin(login.trim());
  };

  return (
    <div className="login-screen">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Bienvenue sur le Chat IRC</h2>
        <input
          type="text"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="Entrez votre nom d'utilisateur"
          maxLength={20}
        />
        <button type="submit">Se connecter</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}
