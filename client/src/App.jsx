import React, { useState } from "react";
import LoginModal from "./components/LoginModal.jsx";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [login, setLogin] = useState("");

  const handleLogin = (pseudo) => {
    setLogin(pseudo);
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <LoginModal onLogin={handleLogin} />;
  }

  return (
    <div>
      <h1>Chat IRC</h1>
      <p>Bienvenue {login} !</p>
    </div>
  );
}

export default App;