import { useEffect, useRef } from "react";
import io from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

export default function useSocket(login, isLoggedIn) {
  const socketRef = useRef(null);

  // Initilisation socket
  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    return () => socket.disconnect();
  }, []);

  const loginUser = (loginValue) => {
    socketRef.current.emit("login", loginValue);
  };

  return {
    loginUser,
  };
}