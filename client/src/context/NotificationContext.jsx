import React, { createContext, useContext, useState, useEffect } from 'react';
import { API } from '@/api';
import { isLoggedIn } from '@/utils/auth';
import { toast } from 'sonner';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [friendRequests, setFriendRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchRequests = async () => {
        if (!isLoggedIn()) return;
        try {
            const res = await API.get('/friends/requests');
            setFriendRequests(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to fetch friend requests:', err);
        }
    };

    const fetchSentRequests = async () => {
        if (!isLoggedIn()) return;
        try {
            const res = await API.get('/friends/sent');
            setSentRequests(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to fetch sent requests:', err);
        }
    };

    const fetchFriends = async () => {
        if (!isLoggedIn()) return;
        try {
            const res = await API.get('/friends');
            setFriends(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to fetch friends:', err);
        }
    };

    const loadSocialData = async () => {
        if (!isLoggedIn()) return;
        setLoading(true);
        await Promise.all([fetchRequests(), fetchSentRequests(), fetchFriends()]);
        setLoading(false);
    };

    const sendRequest = async (userId) => {
        try {
            await API.post(`/friends/${userId}`);
            toast.success("Friend request sent!");
            fetchSentRequests();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send request");
        }
    };

    const acceptRequest = async (requestId) => {
        try {
            // Optimistic Update
            setFriendRequests(prev => prev.filter(req => req._id !== requestId));
            await API.post(`/friends/accept/${requestId}`);
            toast.success("Friend request accepted!");
            loadSocialData(); // Refresh everything to update friends list
        } catch (err) {
            toast.error("Failed to accept request");
            fetchRequests();
        }
    };

    const declineRequest = async (requestId) => {
        try {
            // Optimistic Update
            setFriendRequests(prev => prev.filter(req => req._id !== requestId));
            await API.post(`/friends/decline/${requestId}`);
            toast.success("Request declined");
            fetchRequests();
        } catch (err) {
            toast.error("Failed to decline request");
            fetchRequests();
        }
    };

    useEffect(() => {
        if (isLoggedIn()) {
            loadSocialData();
        }
    }, []);

    return (
        <NotificationContext.Provider value={{
            friendRequests,
            sentRequests,
            friends,
            loading,
            fetchRequests,
            fetchSentRequests,
            fetchFriends,
            loadSocialData,
            sendRequest,
            acceptRequest,
            declineRequest
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
