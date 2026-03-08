import { useState, useEffect, useCallback, useRef } from "react";
import { connectSocket, isSocketConnected } from "@/utils/socket";

export default function useFeedUpdates() {
    const [newItemsCount, setNewItemsCount] = useState(0);
    const [latestEngagement, setLatestEngagement] = useState(null);
    const socketRef = useRef(null);
    const cleanupRef = useRef(null);

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

        // Store cleanup function
        cleanupRef.current = () => {
            if (socketRef.current && isSocketConnected()) {
                socketRef.current.off("feed:new_content", handleNewContent);
                socketRef.current.off("feed:engagement_update", handleEngagement);
                socketRef.current.emit("leave_feed");
            }
        };

        return cleanupRef.current;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
            }
        };
    }, []);

    const clearNewItems = useCallback(() => {
        setNewItemsCount(0);
    }, []);

    return { newItemsCount, clearNewItems, latestEngagement };
}
