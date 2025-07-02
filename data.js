const users = new Map();
const channels = new Map();
const privateMessages = new Map();
const channelTimers = {};

channels.set("Général", {
  members: new Set(),
  messages: [],
  creator: null,
});

module.exports = {
  users,
  channels,
  privateMessages,
  channelTimers,
};
