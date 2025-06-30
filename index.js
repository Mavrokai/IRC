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

  socket.on("joinChannel", (channelName) => {
    const user = users.get(socket.id);
    if (!user) return;

    let channel = channels.get(channelName);
    if (!channel) {
      channel = { members: new Set(), messages: [], creator: user.login };
      channels.set(channelName, channel);
    }

    channel.members.add(socket.id);
    user.channels.add(channelName);

    socket.join(channelName);

    socket.to(channelName).emit("userJoinedChannel", channelName, user.login);

    console.log(`${user.login} a rejoint ${channelName}`);
  });

  socket.on("leaveChannel", (channelName) => {
    const user = users.get(socket.id);
    if (!user) return;

    const channel = channels.get(channelName);
    if (channel) {
      channel.members.delete(socket.id);
      user.channels.delete(channelName);
      socket.leave(channelName);

      socket.to(channelName).emit("userLeftChannel", channelName, user.login);
    }

    console.log(`${user.login} a quitté ${channelName}`);
  });

  socket.on("createChannel", (channelName) => {
    const user = users.get(socket.id);
    if (!user) return;

    if (channels.has(channelName)) {
      socket.emit("channelError", "Ce channel existe déjà");
      return;
    }

    channels.set(channelName, {
      members: new Set([socket.id]),
      messages: [],
      creator: user.login,
    });
    user.channels.add(channelName);
    socket.join(channelName);

    io.emit("channelsList", getChannelsList());
    io.emit("channelCreated", channelName, user.login);

    console.log(`${user.login} a créé le channel ${channelName}`);
  });

  socket.on("deleteChannel", (channelName) => {
    const user = users.get(socket.id);
    if (!user) return;

    const channel = channels.get(channelName);
    if (!channel) return;

    if (channel.creator !== user.login) {
      socket.emit("channelError", "Vous n'êtes pas le créateur de ce channel");
      return;
    }

    channel.members.forEach((socketId) => {
      const member = users.get(socketId);
      if (member) {
        member.channels.delete(channelName);
      }
    });

    channels.delete(channelName);
    io.emit("channelsList", getChannelsList());
    io.emit("channelDeleted", channelName, user.login);

    console.log(`${user.login} a supprimé le channel ${channelName}`);
  });
});

function getOnlineUsers() {
  return Array.from(users.values()).map((user) => user.login);
}

function getChannelsList() {
  return Array.from(channels.entries()).map(([name, data]) => ({
    name,
    creator: data.creator,
  }));
}

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
