import React, { useState } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [login, setLogin] = useState("");

  if (!isLoggedIn) {
    return (
      <div>
        <h1>Chat IRC</h1>
        <p>Veuillez vous connecter</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Chat IRC</h1>
      <p>Bienvenue {login} !</p>
    </div>
  );
}

export default App;
