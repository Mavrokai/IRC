import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import useSocketActions from "./useSocketActions.js";
import useSocketEvents from "./useSocketEvents.js";

const SOCKET_URL = "http://localhost:3000";

export default function useSocket(
  login,
  isLoggedIn,
  currentChannel,
  avatar,
  onSelectedPrivateChange
) {
  const [channels, setChannels] = useState(["Général"]);
  const [userChannels, setUserChannels] = useState(new Set(["Général"]));
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [privateMessages, setPrivateMessages] = useState({});
  const [channelMembers, setChannelMembers] = useState([]);
  const [error, setError] = useState("");
  const [privateConversations, setPrivateConversations] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !currentChannel) return;
    if (typeof currentChannel === "object" && currentChannel.isPrivate) {
      socket.emit("getPrivateHistory", currentChannel.user);
    } else {
      socket.emit("getChannelMessages", currentChannel);
    }
  }, [currentChannel]);

  useSocketEvents({
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
  });

  const actions = useSocketActions({
    socketRef,
    avatar,
    setUserChannels,
    setError,
  });

  const handleOtherUserLoginChange = (oldLogin, newLogin) => {
    return { oldLogin, newLogin };
  };

  return {
    channels,
    userChannels,
    users,
    messages,
    channelMembers,
    error,
    ...actions,
    setUserChannels,
    setError,
    privateConversations,
    privateMessages,
    handleOtherUserLoginChange,
  };
}
