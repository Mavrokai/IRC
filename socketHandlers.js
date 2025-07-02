const {
  users,
  channels,
  privateMessages,
  channelTimers,
} = require("./data.js");

const {
  getChannelsList,
  getChannelMembers,
  getOnlineUsers,
  addSystemMessageToAllChannels,
  getPrivateKey,
  resetChannelTimer,
} = require("./helpers.js");

module.exports = function (io) {
  io.on("connection", (socket) => {
    socket.emit("channelsList", getChannelsList(channels));

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
      const generalChannel = channels.get("Général");
      if (generalChannel) {
        generalChannel.members.add(socket.id);
        socket.join("Général");
      }
      io.emit("userJoined", login);
      io.emit("onlineUsers", getOnlineUsers(users));
      io.emit("channelsList", getChannelsList(channels));
      io.to("Général").emit(
        "channelMembers",
        "Général",
        getChannelMembers("Général", channels, users)
      );
      addSystemMessageToAllChannels(`${login} s'est connecté`, channels, io);
      const messages = generalChannel ? generalChannel.messages : [];
      socket.emit("channelMessages", "Général", messages);
      socket.emit(
        "channelMembers",
        "Général",
        getChannelMembers("Général", channels, users)
      );
    });

    socket.on("joinChannel", (channelName) => {
      const user = users.get(socket.id);
      if (!user) return;
      let channel = channels.get(channelName);
      if (!channel) {
        channel = { members: new Set(), messages: [], creator: user.login };
        channels.set(channelName, channel);
        io.emit("channelsList", getChannelsList(channels));
        resetChannelTimer(
          channelName,
          channelTimers,
          channels,
          io,
          addSystemMessageToAllChannels,
          getChannelsList
        );
      }
      channel.members.add(socket.id);
      user.channels.add(channelName);
      socket.join(channelName);
      socket.emit("channelMessages", channelName, channel.messages);
      socket.emit(
        "channelMembers",
        channelName,
        getChannelMembers(channelName, channels, users)
      );
      socket.to(channelName).emit("userJoinedChannel", channelName, user.login);
      socket
        .to(channelName)
        .emit(
          "channelMembers",
          channelName,
          getChannelMembers(channelName, channels, users)
        );
      io.emit("channelsList", getChannelsList(channels));
      io.to(channelName).emit(
        "channelMembers",
        channelName,
        getChannelMembers(channelName, channels, users)
      );
      const joinMessage = {
        system: true,
        message: `${user.login} a rejoint le channel ${channelName}`,
        timestamp: new Date().toLocaleTimeString(),
        channel: channelName,
      };
      channel.messages.push(joinMessage);
      io.to(channelName).emit("message", joinMessage);
      resetChannelTimer(
        channelName,
        channelTimers,
        channels,
        io,
        addSystemMessageToAllChannels,
        getChannelsList
      );
    });

    socket.on("leaveChannel", (channelName) => {
      const user = users.get(socket.id);
      if (!user) return;
      const channel = channels.get(channelName);
      if (!channel) return;
      channel.members.delete(socket.id);
      user.channels.delete(channelName);
      socket.leave(channelName);
      socket.to(channelName).emit("userLeftChannel", channelName, user.login);
      socket
        .to(channelName)
        .emit(
          "channelMembers",
          channelName,
          getChannelMembers(channelName, channels, users)
        );
      io.emit("channelsList", getChannelsList(channels));
      io.to(channelName).emit(
        "channelMembers",
        channelName,
        getChannelMembers(channelName, channels, users)
      );
      const leaveMessage = {
        system: true,
        message: `${user.login} a quitté le channel ${channelName}`,
        timestamp: new Date().toLocaleTimeString(),
        channel: channelName,
      };
      channel.messages.push(leaveMessage);
      io.to(channelName).emit("message", leaveMessage);
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
      socket.emit("channelMessages", channelName, []);
      socket.emit(
        "channelMembers",
        channelName,
        getChannelMembers(channelName, channels, users)
      );
      io.emit("channelsList", getChannelsList(channels));
      io.emit("channelCreated", channelName, user.login);
      addSystemMessageToAllChannels(
        `${user.login} a créé le channel ${channelName}`,
        channels,
        io
      );
      resetChannelTimer(
        channelName,
        channelTimers,
        channels,
        io,
        addSystemMessageToAllChannels,
        getChannelsList
      );
    });

    socket.on("deleteChannel", (channelName) => {
      const user = users.get(socket.id);
      if (!user) return;
      if (channelName === "Général") {
        socket.emit(
          "channelError",
          "Le channel Général ne peut pas être supprimé"
        );
        return;
      }
      const channel = channels.get(channelName);
      if (!channel) return;
      if (channel.creator !== user.login) {
        socket.emit(
          "channelError",
          "Seul le créateur peut supprimer ce channel"
        );
        return;
      }
      channel.members.forEach((memberSocketId) => {
        const memberUser = users.get(memberSocketId);
        if (memberUser) {
          memberUser.channels.delete(channelName);
          const memberSocket = io.sockets.sockets.get(memberSocketId);
          if (memberSocket) {
            memberSocket.leave(channelName);
          }
        }
      });
      channels.delete(channelName);
      io.emit("channelsList", getChannelsList(channels));
      io.emit("channelDeleted", channelName, user.login);
      addSystemMessageToAllChannels(
        `${user.login} a supprimé le channel ${channelName}`,
        channels,
        io
      );
      if (channelTimers[channelName]) {
        clearTimeout(channelTimers[channelName]);
        delete channelTimers[channelName];
      }
    });

    socket.on("renameChannel", (oldName, newName) => {
      const user = users.get(socket.id);
      if (!user) return;
      if (!channels.has(oldName)) {
        socket.emit("channelError", "Channel introuvable");
        return;
      }
      if (channels.has(newName)) {
        socket.emit("channelError", "Un channel avec ce nom existe déjà");
        return;
      }
      const channel = channels.get(oldName);
      if (channel.creator !== user.login) {
        socket.emit(
          "channelError",
          "Seul le créateur peut modifier ce channel"
        );
        return;
      }
      channels.set(newName, { ...channel });
      channels.delete(oldName);
      channel.members.forEach((memberSocketId) => {
        const memberUser = users.get(memberSocketId);
        if (memberUser) {
          memberUser.channels.delete(oldName);
          memberUser.channels.add(newName);
          const memberSocket = io.sockets.sockets.get(memberSocketId);
          if (memberSocket) {
            memberSocket.leave(oldName);
            memberSocket.join(newName);
          }
        }
      });
      io.emit("channelsList", getChannelsList(channels));
      io.emit("channelRenamed", oldName, newName);
      addSystemMessageToAllChannels(
        `${user.login} a renommé le channel ${oldName} en ${newName}`,
        channels,
        io
      );
      if (channelTimers[oldName]) {
        clearTimeout(channelTimers[oldName]);
        delete channelTimers[oldName];
      }
      resetChannelTimer(
        newName,
        channelTimers,
        channels,
        io,
        addSystemMessageToAllChannels,
        getChannelsList
      );
    });

    socket.on("message", (channelName, message, avatar) => {
      const user = users.get(socket.id);
      if (!user) return;
      const channel = channels.get(channelName);
      if (!channel) return;
      if (!channel.members.has(socket.id)) {
        socket.emit("messageError", "Vous n'êtes pas membre de ce channel");
        return;
      }
      const messageObj = {
        user: user.login,
        message: message,
        timestamp: new Date().toLocaleTimeString(),
        channel: channelName,
        avatar: avatar || null,
      };
      channel.messages.push(messageObj);
      io.to(channelName).emit("message", messageObj);
      io.to(channelName).emit(
        "channelMembers",
        channelName,
        getChannelMembers(channelName, channels, users)
      );
      resetChannelTimer(
        channelName,
        channelTimers,
        channels,
        io,
        addSystemMessageToAllChannels,
        getChannelsList
      );
    });

    socket.on("privateMessage", (targetLogin, message, avatar) => {
      const user = users.get(socket.id);
      if (!user) return;
      const targetUser = Array.from(users.values()).find(
        (userData) => userData.login === targetLogin
      );
      if (!targetUser) {
        socket.emit("messageError", "Utilisateur non trouvé");
        return;
      }
      const messageObj = {
        from: user.login,
        to: targetLogin,
        message: message,
        timestamp: new Date().toLocaleTimeString(),
        isPrivate: true,
        avatar: avatar || null,
      };
      const key = getPrivateKey(user.login, targetLogin);
      if (!privateMessages.has(key)) privateMessages.set(key, []);
      privateMessages.get(key).push(messageObj);
      socket.emit("privateMessage", messageObj);
      const targetSocket = Array.from(users.entries()).find(
        ([, u]) => u.login === targetLogin
      );
      if (targetSocket) {
        io.to(targetSocket[0]).emit("privateMessage", messageObj);
      }
    });

    socket.on("getPrivateConversations", () => {
      const user = users.get(socket.id);
      if (!user) return;
      const convos = [];
      for (const key of privateMessages.keys()) {
        const [a, b] = key.split("|");
        if (a === user.login || b === user.login) {
          const other = a === user.login ? b : a;
          convos.push(other);
        }
      }
      convos.sort((u1, u2) => {
        const k1 = getPrivateKey(user.login, u1);
        const k2 = getPrivateKey(user.login, u2);
        const m1 = privateMessages.get(k1);
        const m2 = privateMessages.get(k2);
        const t1 = m1 && m1.length ? m1[m1.length - 1].timestamp : 0;
        const t2 = m2 && m2.length ? m2[m2.length - 1].timestamp : 0;
        return t2.localeCompare(t1);
      });
      socket.emit("privateConversations", convos);
    });

    socket.on("getPrivateHistory", (otherLogin) => {
      const user = users.get(socket.id);
      if (!user) return;
      const key = getPrivateKey(user.login, otherLogin);
      const history = privateMessages.get(key) || [];
      if (key.includes(user.login)) {
        socket.emit("privateHistory", otherLogin, history);
      }
    });

    socket.on("getChannelMembers", (channelName) => {
      socket.emit(
        "channelMembers",
        channelName,
        getChannelMembers(channelName, channels, users)
      );
    });

    socket.on("getChannelsList", () => {
      socket.emit("channelsList", getChannelsList(channels));
    });

    socket.on("getOnlineUsers", () => {
      socket.emit("onlineUsers", getOnlineUsers(users));
    });

    socket.on("getChannelMessages", (channelName) => {
      const user = users.get(socket.id);
      const channel = channels.get(channelName);
      if (user && channel && channel.members.has(socket.id)) {
        socket.emit("channelMessages", channelName, channel.messages);
      } else {
        socket.emit("channelMessages", channelName, []);
      }
    });

    socket.on("changeLogin", (oldLogin, newLogin, callback) => {
      const alreadyUsed = Array.from(users.values()).some(
        (u) => u.login === newLogin
      );
      if (alreadyUsed) {
        callback(false, "Ce pseudo est déjà utilisé");
        return;
      }
      const user = users.get(socket.id);
      if (!user || user.login !== oldLogin) {
        callback(false, "Utilisateur introuvable");
        return;
      }
      user.login = newLogin;
      for (const [name, channel] of channels.entries()) {
        if (channel.creator === oldLogin) {
          channel.creator = newLogin;
        }
        channel.messages.forEach((msg) => {
          if (msg.user === oldLogin) msg.user = newLogin;
          if (msg.from === oldLogin) msg.from = newLogin;
          if (msg.to === oldLogin) msg.to = newLogin;
        });
      }
      for (const [key, messages] of privateMessages.entries()) {
        const [userA, userB] = key.split("|");
        let newKey = key;
        let needsUpdate = false;
        if (userA === oldLogin) {
          newKey = `${newLogin}|${userB}`;
          needsUpdate = true;
        } else if (userB === oldLogin) {
          newKey = `${userA}|${newLogin}`;
          needsUpdate = true;
        }
        if (needsUpdate) {
          messages.forEach((msg) => {
            if (msg.from === oldLogin) msg.from = newLogin;
            if (msg.to === oldLogin) msg.to = newLogin;
          });
          privateMessages.set(newKey, messages);
          privateMessages.delete(key);
        }
      }
      io.emit("onlineUsers", getOnlineUsers(users));
      io.emit("channelsList", getChannelsList(channels));
      io.emit("userChangedLogin", oldLogin, newLogin);
      addSystemMessageToAllChannels(
        `${oldLogin} a changé son pseudo en ${newLogin}`,
        channels,
        io
      );
      callback(true);
    });

    socket.on("disconnect", () => {
      const user = users.get(socket.id);
      if (user) {
        user.channels.forEach((channelName) => {
          const channel = channels.get(channelName);
          if (channel) {
            channel.members.delete(socket.id);
            socket
              .to(channelName)
              .emit("userLeftChannel", channelName, user.login);
            io.to(channelName).emit(
              "channelMembers",
              channelName,
              getChannelMembers(channelName, channels, users)
            );
          }
        });
        users.delete(socket.id);
        addSystemMessageToAllChannels(
          `${user.login} s'est déconnecté`,
          channels,
          io
        );
        io.emit("userLeft", user.login);
        io.emit("onlineUsers", getOnlineUsers(users));
        io.emit("channelsList", getChannelsList(channels));
      }
    });
  });
};
