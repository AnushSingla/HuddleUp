import { useState, useEffect, useCallback } from 'react';
import { API } from '@/api';
import { getToken } from '@/utils/auth';
import { toast } from 'sonner';

export function useSaved() {
  const [savedVideoIds, setSavedVideoIds] = useState(new Set());
  const [savedPostIds, setSavedPostIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const isLoggedIn = !!getToken();

  const fetchSaved = useCallback(async () => {
    if (!getToken()) {
      setSavedVideoIds(new Set());
      setSavedPostIds(new Set());
      setLoading(false);
      return;
    }
    try {
      const res = await API.get('/saved');
      const videos = res.data?.savedVideos || [];
      const posts = res.data?.savedPosts || [];
      setSavedVideoIds(new Set(videos.map((v) => v._id || v)));
      setSavedPostIds(new Set(posts.map((p) => (p._id ? p._id : p))));
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error('Failed to fetch saved:', err);
      }
      setSavedVideoIds(new Set());
      setSavedPostIds(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved, isLoggedIn]);

  const toggleVideo = useCallback(async (videoId) => {
    if (!getToken()) {
      toast.error('Login to save videos');
      return null;
    }
    const id = videoId?._id || videoId;
    if (!id) return null;
    const isSaved = savedVideoIds.has(id);
    try {
      if (isSaved) {
        await API.delete(`/saved/video/${id}`);
        setSavedVideoIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        toast.success('Removed from saved');
        return false;
      } else {
        await API.post(`/saved/video/${id}`);
        setSavedVideoIds((prev) => new Set([...prev, id]));
        toast.success('Saved for later');
        return true;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update saved');
      return null;
    }
  }, [savedVideoIds]);

  const togglePost = useCallback(async (postId) => {
    if (!getToken()) {
      toast.error('Login to save posts');
      return null;
    }
    const id = postId?._id || postId;
    if (!id) return null;
    const isSaved = savedPostIds.has(id);
    try {
      if (isSaved) {
        await API.delete(`/saved/post/${id}`);
        setSavedPostIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        toast.success('Removed from saved');
        return false;
      } else {
        await API.post(`/saved/post/${id}`);
        setSavedPostIds((prev) => new Set([...prev, id]));
        toast.success('Saved for later');
        return true;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update saved');
      return null;
    }
  }, [savedPostIds]);

  return {
    savedVideoIds,
    savedPostIds,
    isVideoSaved: (id) => savedVideoIds.has(id?._id || id),
    isPostSaved: (id) => savedPostIds.has(id?._id || id),
    toggleVideo,
    togglePost,
    refreshSaved: fetchSaved,
    loading,
    isLoggedIn,
  };
}
