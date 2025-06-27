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

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
