function getChannelsList(channels) {
  return Array.from(channels.entries()).map(([name, data]) => ({
    name,
    creator: data.creator,
  }));
}

function getChannelMembers(channelName, channels, users) {
  const channel = channels.get(channelName);
  if (!channel) return [];
  const members = [];
  channel.members.forEach((socketId) => {
    const user = users.get(socketId);
    if (user) {
      members.push(user.login);
    }
  });
  return members;
}

function getOnlineUsers(users) {
  return Array.from(users.values()).map((user) => user.login);
}

function addSystemMessageToAllChannels(message, channels, io) {
  const systemMessage = {
    system: true,
    message: message,
    timestamp: new Date().toLocaleTimeString(),
  };
  for (const channel of channels.values()) {
    if (Array.isArray(channel.messages)) {
      channel.messages.push(systemMessage);
    }
  }
  io.emit("message", systemMessage);
}

function getPrivateKey(userA, userB) {
  return [userA, userB].sort().join("|");
}

function resetChannelTimer(
  channelName,
  channelTimers,
  channels,
  io,
  addSystemMessageToAllChannels,
  getChannelsList
) {
  if (channelTimers[channelName]) {
    clearTimeout(channelTimers[channelName]);
  }
  const CHANNEL_TIMEOUT = 5 * 60 * 1000;
  channelTimers[channelName] = setTimeout(() => {
    if (["Général", "Philosophie", "Technologie"].includes(channelName)) return;
    const channel = channels.get(channelName);
    if (channel) {
      addSystemMessageToAllChannels(
        `Le channel ${channelName} a été supprimé pour inactivité.`,
        channels,
        io
      );
      channels.delete(channelName);
      io.emit("channelsList", getChannelsList(channels));
      io.emit("channelDeleted", channelName, null);
    }
  }, CHANNEL_TIMEOUT);
}

module.exports = {
  getChannelsList,
  getChannelMembers,
  getOnlineUsers,
  addSystemMessageToAllChannels,
  getPrivateKey,
  resetChannelTimer,
};
