import React, { createContext, useContext, useState, useCallback } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within SocketProvider");
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const connect = useCallback(
    (token) => {
      if (socket) {
        console.log("⚠️ Socket already exists, skipping connection");
        return;
      }

      const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

      console.log("🔌 Connecting to Socket.io...", BASE_URL);
      console.log("🔑 Token:", token ? "Present" : "Missing");

      const newSocket = io(BASE_URL, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      newSocket.on("connect", () => {
        console.log("✅ Socket connected!", newSocket.id);
        setConnected(true);
        toast.success("Connected to live updates");
      });

      newSocket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
        setConnected(false);
      });

      newSocket.on("connect_error", (err) => {
        console.error("❌ Socket error:", err.message);
        toast.error("Connection error: " + err.message);
      });

      newSocket.on("online:users", (users) => {
        console.log("👥 Online users:", users);
        setOnlineUsers(users);
      });

      newSocket.on("user:online", (user) => {
        console.log("🟢 User online:", user);
        setOnlineUsers((prev) => [
          ...prev.filter((u) => u.userId !== user.userId),
          user,
        ]);
        toast(`🟢 ${user.name} is now online`, { duration: 2000 });
      });

      newSocket.on("user:offline", (user) => {
        console.log("⚫ User offline:", user);
        setOnlineUsers((prev) => prev.filter((u) => u.userId !== user.userId));
      });

      newSocket.on("notification:new", (notification) => {
        toast(notification.title, {
          icon: "🔔",
          duration: 4000,
          position: "top-right",
        });
        window.dispatchEvent(new CustomEvent("refresh:dashboard"));
        window.dispatchEvent(new CustomEvent("refresh:notifications"));
      });

      newSocket.on("dashboard:update", () => {
        window.dispatchEvent(new CustomEvent("refresh:dashboard"));
      });

      newSocket.on("election:update", () => {
        window.dispatchEvent(new CustomEvent("refresh:elections"));
      });

      newSocket.on("expenditure:update", () => {
        window.dispatchEvent(new CustomEvent("refresh:expenditures"));
        window.dispatchEvent(new CustomEvent("refresh:dashboard"));
      });

      const heartbeatInterval = setInterval(() => {
        if (newSocket.connected) {
          newSocket.emit("heartbeat");
        }
      }, 30000);

      newSocket.heartbeatInterval = heartbeatInterval;
      setSocket(newSocket);

      return newSocket;
    },
    [socket],
  );

  const disconnect = useCallback(() => {
    if (socket) {
      console.log("🔌 Disconnecting socket...");
      if (socket.heartbeatInterval) {
        clearInterval(socket.heartbeatInterval);
      }
      socket.disconnect();
      setSocket(null);
      setConnected(false);
      setOnlineUsers([]);
    }
  }, [socket]);

  const value = {
    socket,
    connected,
    onlineUsers,
    connect,
    disconnect,
    emit: (event, data) => socket?.emit(event, data),
    on: (event, handler) => socket?.on(event, handler),
    off: (event, handler) => socket?.off(event, handler),
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
