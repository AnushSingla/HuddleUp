import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
    if (socket) return socket;

    const url = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
    socket = io(url, {
        autoConnect: false,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        transports: ["websocket", "polling"],
    });

    return socket;
};

export const connectSocket = () => {
    const s = getSocket();
    if (!s.connected) {
        s.connect();
    }
    return s;
};

export const disconnectSocket = () => {
    if (socket && socket.connected) {
        socket.disconnect();
    }
};
