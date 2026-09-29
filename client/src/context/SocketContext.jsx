import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, token } = useAuth();
  const socketRef = useRef(null);
  const activeTokenRef = useRef(null);

  useEffect(() => {
    if (!user || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      activeTokenRef.current = null;
      setSocket(null);
      return;
    }

    if (socketRef.current && activeTokenRef.current === token) {
      setSocket(socketRef.current);
      return;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const newSocket = io("http://localhost:4500", {
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

    const handleGetOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    newSocket.on("getOnlineUsers", handleGetOnlineUsers);

    return () => {
      newSocket.off("getOnlineUsers", handleGetOnlineUsers);
      newSocket.disconnect();
      if (socketRef.current === newSocket) {
        socketRef.current = null;
      }
      if (activeTokenRef.current === token) {
        activeTokenRef.current = null;
      }
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
