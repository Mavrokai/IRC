import React, { useEffect, useState } from "react";
import ChannelList from "./components/ChannelList.jsx";
import ChatHeader from "./components/ChatHeader.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import ErrorBanner from "./components/ErrorBanner.jsx";
import LoginModal from "./components/LoginModal.jsx";
import MessageInput from "./components/MessageInput.jsx";
import PrivateConvoList from "./components/PrivateConvoList.jsx";
import ProfileSection from "./components/ProfileSection.jsx";
import UserList from "./components/UserList.jsx";
import "./style.css";
import useSocket from "./useSocket.js";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [login, setLogin] = useState("");
  const [currentChannel, setCurrentChannel] = useState("Général");
  const [avatar, setAvatar] = useState("");
  const [readMessagesCount, setReadMessagesCount] = useState({});
  const [selectedPrivate, setSelectedPrivate] = useState(null);

  const handleOtherUserLoginChange = (oldLogin, newLogin) => {
    if (selectedPrivate === oldLogin) {
      setSelectedPrivate(newLogin);
    }
  };

  const {
    channels,
    userChannels,
    users,
    messages,
    channelMembers,
    error,
    loginUser,
    joinChannel,
    leaveChannel,
    createChannel,
    deleteChannel,
    sendMessage,
    sendPrivate,
    setUserChannels,
    setError,
    changeLogin,
    renameChannel,
    privateConversations,
    privateMessages,
    getPrivateHistory,
  } = useSocket(
    login,
    isLoggedIn,
    selectedPrivate
      ? { isPrivate: true, user: selectedPrivate }
      : currentChannel,
    avatar,
    handleOtherUserLoginChange
  );

  const handleLogin = (loginValue) => {
    setLogin(loginValue);
    loginUser(loginValue);
    setIsLoggedIn(true);
    setCurrentChannel("Général");
    setError("");
  };

  const handleJoinChannel = (channel) => {
    setSelectedPrivate(null);
    if (userChannels.has(channel)) {
      setCurrentChannel(channel);
      setError("");
      return;
    }
    joinChannel(channel);
    setCurrentChannel(channel);
    setError("");
  };
  const handleLeaveChannel = (channel) => {
    leaveChannel(channel);
    if (currentChannel === channel) {
      setCurrentChannel("");
    }
    setError("");
  };
  const handleCreateChannel = (channelName) => {
    createChannel(channelName);
    setError("");
  };
  const handleDeleteChannel = (channel) => {
    deleteChannel(channel);
    setError("");
  };

  const handleSendMessage = (msg) => {
    if (typeof msg === "object" && msg.command) {
      const { command, args } = msg;
      switch (command) {
        case "nick":
          if (args[0]) handleChangeLogin(args[0]);
          else setError("Usage : /nick nouveau_pseudo");
          break;
        case "list":
          const filter = args[0] ? args[0].toLowerCase() : null;
          const list = channels
            .filter(
              (c) => !filter || (c.name || c).toLowerCase().includes(filter)
            )
            .map((c) => c.name || c)
            .join(", ");
          setError("Channels : " + (list || "Aucun"));
          break;
        case "create":
          if (args[0]) handleCreateChannel(args[0]);
          else setError("Usage : /create nom_du_channel");
          break;
        case "delete":
          if (args[0]) handleDeleteChannel(args[0]);
          else setError("Usage : /delete nom_du_channel");
          break;
        case "join":
          if (args[0]) handleJoinChannel(args[0]);
          else setError("Usage : /join nom_du_channel");
          break;
        case "leave":
          if (currentChannel) handleLeaveChannel(currentChannel);
          else setError("Aucun channel sélectionné");
          break;
        case "users":
          setError(
            "Utilisateurs : " +
              (channelMembers && channelMembers.length
                ? channelMembers.join(", ")
                : "Aucun")
          );
          break;
        case "msg":
          if (args[0] && args[1]) {
            const target = args[0];
            const privateMsg = args.slice(1).join(" ");
            handleSendPrivate(target, privateMsg);
          } else {
            setError("Usage : /msg pseudo message");
          }
          break;
        default:
          setError("Commande inconnue : /" + command);
      }
      return;
    }

    if (selectedPrivate) {
      sendPrivate(selectedPrivate, msg);
      setError("");
      return;
    }

    sendMessage(msg, currentChannel);
    setError("");
  };
  const handleSendPrivate = (target, msg) => {
    sendPrivate(target, msg);
    setError("");
  };

  const privateUsers = users.filter((u) => u !== login);

  const handleRenameChannel = (oldName, newName) => {
    if (!newName.trim() || oldName === newName) return;
    if (window.confirm(`Renommer le channel "${oldName}" en "${newName}" ?`)) {
      renameChannel(oldName, newName);
    }
  };

  const handleChangeLogin = (newLogin) => {
    if (!newLogin.trim() || newLogin === login) return;
    const oldLogin = login;
    changeLogin(login, newLogin, (success, errorMsg) => {
      if (success) {
        setLogin(newLogin);

        if (selectedPrivate === oldLogin) {
          setSelectedPrivate(newLogin);
        }
      } else {
        setError(errorMsg || "Erreur lors du changement de pseudo");
      }
    });
  };

  const handleSelectPrivate = (pseudo) => {
    setSelectedPrivate(pseudo);
    getPrivateHistory(pseudo);
    setError("");
  };

  useEffect(() => {
    if (currentChannel && channels && channels.length > 0) {
      const channelObj = channels.find(
        (c) => c.name === currentChannel || c === currentChannel
      );
      if (channelObj) {
        setReadMessagesCount((prev) => ({
          ...prev,
          [currentChannel]: messages.length,
        }));
      }
    }
  }, [currentChannel, messages.length]);

  if (!isLoggedIn) {
    return <LoginModal onLogin={handleLogin} />;
  }

  return (
    <div className="layout-discord">
      <aside className="sidebar">
        <ProfileSection
          login={login}
          onChangeLogin={handleChangeLogin}
          avatar={avatar}
          onChangeAvatar={setAvatar}
        />
        <div className="header">
          <h2>Chat IRC</h2>
          <p>{isLoggedIn ? login : null}</p>
        </div>
        <div className="channels-section">
          <h3>Channels</h3>
          <ChannelList
            channels={channels}
            currentChannel={currentChannel}
            onJoin={handleJoinChannel}
            onLeave={handleLeaveChannel}
            onDelete={handleDeleteChannel}
            onCreate={handleCreateChannel}
            userChannels={userChannels}
            login={login}
            onRename={handleRenameChannel}
            unreadCounts={channels.reduce((acc, c) => {
              const name = c.name || c;
              const total = Array.isArray(c.messages) ? c.messages.length : 0;
              const read = readMessagesCount[name] || 0;
              if (total > read && name !== currentChannel) {
                acc[name] = total - read;
              }
              return acc;
            }, {})}
          />
        </div>
        <div className="users-section">
          <h3>Utilisateurs en ligne</h3>
          <UserList users={users} currentUser={login} />
        </div>
      </aside>
      <main className="chat-center">
        <ChatHeader
          selectedPrivate={selectedPrivate}
          currentChannel={currentChannel}
          channelMembers={channelMembers}
          onBack={() => setSelectedPrivate(null)}
          login={login}
        />
        <ChatWindow messages={messages} />
        <div className="input-section">
          <MessageInput
            onSend={handleSendMessage}
            disabled={
              selectedPrivate
                ? false
                : !userChannels.has(currentChannel) || !currentChannel
            }
          />
        </div>
        <ErrorBanner error={error} />
      </main>
      <PrivateConvoList
        privateConversations={privateConversations}
        selectedPrivate={selectedPrivate}
        onSelect={handleSelectPrivate}
      />
    </div>
  );
}
