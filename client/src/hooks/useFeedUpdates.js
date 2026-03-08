import { useState, useEffect, useCallback, useRef } from "react";
import { connectSocket } from "@/utils/socket";

export default function useFeedUpdates() {
    const [newItemsCount, setNewItemsCount] = useState(0);
    const [latestEngagement, setLatestEngagement] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        const socket = connectSocket();
        socketRef.current = socket;

        socket.emit("join_feed");

        const handleNewContent = () => {
            setNewItemsCount((prev) => prev + 1);
        };

        const handleEngagement = (data) => {
            setLatestEngagement(data);
        };

        socket.on("feed:new_content", handleNewContent);
        socket.on("feed:engagement_update", handleEngagement);

        return () => {
            socket.off("feed:new_content", handleNewContent);
            socket.off("feed:engagement_update", handleEngagement);
            socket.emit("leave_feed");
        };
    }, []);

    const clearNewItems = useCallback(() => {
        setNewItemsCount(0);
    }, []);

    return { newItemsCount, clearNewItems, latestEngagement };
}
