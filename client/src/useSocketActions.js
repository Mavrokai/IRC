export default function useSocketActions({
  socketRef,
  avatar,
  setUserChannels,
  setError,
}) {
  const loginUser = (loginValue) => {
    socketRef.current.emit("login", loginValue);
    setUserChannels(new Set(["Général"]));
    setError("");
    socketRef.current.emit("getOnlineUsers");
    socketRef.current.emit("getPrivateConversations");
  };
  const joinChannel = (channel) => {
    socketRef.current.emit("joinChannel", channel);
    setUserChannels((prev) => new Set([...prev, channel]));
    setError("");
    socketRef.current.emit("getChannelMembers", channel);
    socketRef.current.emit("getChannelsList");
  };
  const leaveChannel = (channel) => {
    socketRef.current.emit("leaveChannel", channel);
    setUserChannels((prev) => {
      const newSet = new Set([...prev]);
      newSet.delete(channel);
      return newSet;
    });
    setError("");
    socketRef.current.emit("getChannelMembers", channel);
    socketRef.current.emit("getChannelsList");
  };
  const createChannel = (name) => {
    if (!name.trim()) return;
    socketRef.current.emit("createChannel", name.trim());
    setError("");
    socketRef.current.emit("getChannelsList");
  };
  const deleteChannel = (name) => {
    socketRef.current.emit("deleteChannel", name);
    setError("");
    socketRef.current.emit("getChannelsList");
  };
  const sendMessage = (msg, channel) => {
    if (typeof channel === "object" && channel.isPrivate) {
      socketRef.current.emit("privateMessage", channel.user, msg, avatar);
    } else {
      socketRef.current.emit("message", channel, msg, avatar);
      socketRef.current.emit("getChannelMembers", channel);
    }
    setError("");
  };
  const sendPrivate = (target, msg) => {
    socketRef.current.emit("privateMessage", target, msg, avatar);
    setError("");
  };
  const getPrivateHistory = (other) => {
    socketRef.current.emit("getPrivateHistory", other);
  };
  const changeLogin = (oldLogin, newLogin, callback) => {
    socketRef.current.emit("changeLogin", oldLogin, newLogin, (success) => {
      callback(success);
    });
  };
  const renameChannel = (oldName, newName) => {
    socketRef.current.emit("renameChannel", oldName, newName);
  };
  return {
    loginUser,
    joinChannel,
    leaveChannel,
    createChannel,
    deleteChannel,
    sendMessage,
    sendPrivate,
    getPrivateHistory,
    changeLogin,
    renameChannel,
  };
}
