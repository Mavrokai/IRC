const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const users = new Map();
const channels = new Map();

channels.set("Général", {
  members: new Set(),
  messages: [],
  creator: null,
});
channels.set("Philosophie", {
  members: new Set(),
  messages: [],
  creator: null,
});
channels.set("Technologie", {
  members: new Set(),
  messages: [],
  creator: null,
});

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("Un utilisateur s'est connecté");

  socket.on("login", (login) => {
    const existingUser = Array.from(users.values()).find(
      (user) => user.login === login
    );
    if (existingUser) {
      socket.emit("loginError", "Ce login est déjà utilisé");
      return;
    }

    users.set(socket.id, {
      login: login,
      channels: new Set(["Général"]),
    });

    io.emit("userJoined", login);
    io.emit("onlineUsers", getOnlineUsers());

    console.log(`${login} s'est connecté`);
  });

  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      io.emit("userLeft", user.login);
      io.emit("onlineUsers", getOnlineUsers());
      console.log(`${user.login} s'est déconnecté`);
    }
  });
});

function getOnlineUsers() {
  return Array.from(users.values()).map((user) => user.login);
}

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
