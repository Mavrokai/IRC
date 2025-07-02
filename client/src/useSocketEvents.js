import { useEffect } from "react";

export default function useSocketEvents({
  socketRef,
  login,
  currentChannel,
  avatar,
  onSelectedPrivateChange,
  setChannels,
  setUsers,
  setMessages,
  setPrivateMessages,
  setChannelMembers,
  setError,
  setPrivateConversations,
  setUserChannels,
}) {
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.on("channelsList", (list) => setChannels(list));
    socket.on("onlineUsers", (list) => setUsers(list));
    socket.on("channelMessages", (channelName, msgs) => {
      if (channelName === currentChannel) setMessages(msgs);
    });
    socket.on("channelMembers", (channelName, members) => {
      if (channelName === currentChannel) setChannelMembers(members);
    });
    socket.on("message", (msg) => {
      if (
        !msg ||
        typeof msg !== "object" ||
        !msg.message ||
        typeof msg.message !== "string"
      ) {
        console.warn("Message de channel invalide reçu:", msg);
        return;
      }
      if (msg.system && !msg.channel) {
        setMessages((prev) => [...prev, msg]);
      } else if (msg.channel === currentChannel) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    socket.on("privateMessage", (msg) => {
      if (
        !msg ||
        typeof msg !== "object" ||
        !msg.message ||
        typeof msg.message !== "string"
      ) {
        console.warn("Message privé invalide reçu:", msg);
        return;
      }
      const other = msg.from === login ? msg.to : msg.from;
      setPrivateMessages((prev) => {
        const arr = prev[other] ? [...prev[other], msg] : [msg];
        return { ...prev, [other]: arr };
      });
      if (
        typeof currentChannel === "object" &&
        currentChannel.isPrivate &&
        currentChannel.user === other
      ) {
        setMessages((prev) => [...prev, msg]);
      }
      socket.emit("getPrivateConversations");
    });
    socket.on("privateConversations", (list) => {
      setPrivateConversations(list);
    });
    socket.on("privateHistory", (other, msgs) => {
      setPrivateMessages((prev) => ({ ...prev, [other]: msgs }));
      if (
        typeof currentChannel === "object" &&
        currentChannel.isPrivate &&
        currentChannel.user === other
      ) {
        setMessages(msgs);
      }
    });
    socket.on("loginError", (err) => setError(err));
    socket.on("channelError", (err) => setError(err));
    socket.on("messageError", (err) => setError(err));
    socket.on("channelCreated", (channelName, creator) => {
      socket.emit("getChannelMembers", channelName);
      socket.emit("getChannelsList");
      if (creator === login) {
        setUserChannels((prev) => new Set([...prev, channelName]));
      }
    });
    socket.on("channelDeleted", (channelName) => {
      socket.emit("getChannelsList");
      socket.emit("getChannelMembers", currentChannel);
      setUserChannels((prev) => {
        const newSet = new Set([...prev]);
        newSet.delete(channelName);
        return newSet;
      });
    });
    socket.on("userJoinedChannel", (channelName, user) => {
      if (channelName === currentChannel) {
        socket.emit("getChannelMembers", channelName);
      }
    });
    socket.on("userLeftChannel", (channelName, user) => {
      if (channelName === currentChannel) {
        setMessages((prev) => [
          ...prev,
          {
            system: true,
            message: `${user} a quitté le channel`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        socket.emit("getChannelMembers", channelName);
      }
    });
    socket.on("userJoined", (user) => {
      setMessages((prev) => [
        ...prev,
        {
          system: true,
          message: `${user} s'est connecté`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      socket.emit("getOnlineUsers");
    });
    socket.on("userLeft", (user) => {
      setMessages((prev) => [
        ...prev,
        {
          system: true,
          message: `${user} s'est déconnecté`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      socket.emit("getOnlineUsers");
    });
    socket.on("userChangedLogin", (oldLogin, newLogin) => {
      setPrivateMessages((prev) => {
        const updated = {};
        for (const [other, messages] of Object.entries(prev)) {
          const updatedMessages = messages.map((msg) => {
            if (msg.from === oldLogin) {
              return { ...msg, from: newLogin };
            }
            if (msg.to === oldLogin) {
              return { ...msg, to: newLogin };
            }
            return msg;
          });
          updated[other] = updatedMessages;
        }
        return updated;
      });
      socket.emit("getPrivateConversations");
      if (onSelectedPrivateChange) {
        onSelectedPrivateChange(oldLogin, newLogin);
      }
    });
    socket.emit("getPrivateConversations");
    return () => {
      socket.off();
    };
  }, [
    socketRef,
    login,
    currentChannel,
    onSelectedPrivateChange,
    setChannels,
    setUsers,
    setMessages,
    setPrivateMessages,
    setChannelMembers,
    setError,
    setPrivateConversations,
    setUserChannels,
  ]);
}
