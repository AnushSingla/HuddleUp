import { useState, useEffect, useCallback } from 'react';
import { API } from '@/api';
import { getToken } from '@/utils/auth';

const POLL_INTERVAL_MS = 10000; // 10s – notifications feel quicker

export function useNotificationFeed(options = {}) {
  const { limit = 20, skip = 0, poll = true } = options;
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!getToken()) return;
    try {
      const [listRes, countRes] = await Promise.all([
        API.get('/notifications', { params: { limit, skip } }),
        API.get('/notifications/unread-count'),
      ]);
      const list = Array.isArray(listRes.data) ? listRes.data : [];
      setNotifications(list);
      setUnreadCount(countRes.data?.unreadCount ?? 0);
      setError(null);
    } catch (err) {
      setError(err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [limit, skip]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await API.post(`/notifications/mark-as-read/${notificationId}`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Mark as read failed:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await API.post('/notifications/mark-all-as-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all as read failed:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await API.delete(`/notifications/${notificationId}`);
      const n = notifications.find((x) => x._id === notificationId);
      setNotifications((prev) => prev.filter((x) => x._id !== notificationId));
      if (n && !n.isRead) setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Delete notification failed:', err);
    }
  }, [notifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!poll || !getToken()) return;
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [poll, fetchNotifications]);

  // Refetch as soon as user comes back to this tab (e.g. after commenting from another tab)
  useEffect(() => {
    const onFocus = () => {
      if (getToken()) fetchNotifications();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") onFocus();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
