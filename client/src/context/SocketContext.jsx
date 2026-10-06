/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const getSocketUrl = () => {
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  const isLocalhost = host === "localhost" || host === "127.0.0.1";
  const envUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL;

  if (isLocalhost) {
    if (envUrl && envUrl.includes(":4501")) {
      return envUrl.replace(":4501", ":4500");
    }
    return envUrl || "http://localhost:4500";
  }

  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl;
  }

  return "";
};

const SOCKET_URL = getSocketUrl();
const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, token } = useAuth();
  const socketRef = useRef(null);
  const activeTokenRef = useRef(null);

  useEffect(() => {
    if (!user || !token || !SOCKET_URL) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      activeTokenRef.current = null;
      // schedule state reset outside synchronous effect body
      const t = setTimeout(() => setSocket(null), 0);
      return () => clearTimeout(t);
    }

    if (socketRef.current && activeTokenRef.current === token) {
      setSocket(socketRef.current);
      return;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const newSocket = io(SOCKET_URL, {
      autoConnect: true,
      transports: ["websocket", "polling"],
      auth: { token },
      query: { token },
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketRef.current = newSocket;
    activeTokenRef.current = token;
    setSocket(newSocket);

    const handleGetOnlineUsers = (users) => setOnlineUsers(users);
    newSocket.on("getOnlineUsers", handleGetOnlineUsers);

    return () => {
      newSocket.off("getOnlineUsers", handleGetOnlineUsers);
      newSocket.disconnect();
      if (socketRef.current === newSocket) socketRef.current = null;
      if (activeTokenRef.current === token) activeTokenRef.current = null;
      setSocket(null);
    };
  }, [user, token]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
