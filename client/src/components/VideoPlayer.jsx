import React, { useRef, useState, useEffect } from 'react';
import { X, ThumbsUp, Eye, Heart } from 'lucide-react';
import CommentSection from './CommentSection';
import { API } from '@/api';
import { getToken } from '@/utils/auth';
import { Button } from './ui/button';

const VideoPlayer = ({ video, onClose }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [views, setViews] = useState(0);
  const [hasViewed, setHasViewed] = useState(false);
  const videoId = video._id || video.id;

  const videoUrl = video.videoUrl?.startsWith('/uploads')
    ? `http://localhost:5000${video.videoUrl}`
    : video.videoUrl;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get(`/videos/${videoId}`);
        setLikes(res.data.likes.length);
        setViews(res.data.views);
        // Optional: check if liked by current user
      } catch (err) {
        console.error('Failed to fetch video stats:', err);
      }
    };
    if (videoId) fetchStats();
  }, [videoId]);

  useEffect(() => {
    const incrementView = async () => {
      try {
        await API.post(`/videos/${videoId}/view`);
        setViews((prev) => prev + 1);
      } catch (err) {
        console.error('Failed to increment view:', err);
      }
    };

    if (isPlaying && !hasViewed) {
      incrementView();
      setHasViewed(true);
    }
  }, [isPlaying, hasViewed, videoId]);

  const handleLike = async () => {
    try {
      const res = await API.post(
        `/videos/${videoId}/like`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setIsLiked(res.data.liked);
      setLikes(res.data.likes);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{video.title}</h2>
            <p className="text-sm text-gray-500">{video.category}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video */}
        <div className="bg-black">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="w-full max-h-[40vh]"
            onPlay={() => {
              console.log("▶️ onPlay triggered");
              setIsPlaying(true);
            }}
            onPause={() => setIsPlaying(false)}
          />
        </div>

       
<div className="flex items-center justify-between px-6 py-3 border-b bg-white">
  
  <div className="flex items-center gap-6">
    <button
      onClick={handleLike}
      className={`flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-full transition ${
        isLiked
          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Heart className="w-4 h-4  text-red-600 fill-current" />
      <span>{likes}</span>
    </button>

    <div className="flex items-center text-gray-600 text-sm">
      <Eye className="w-4 h-4 mr-1" />
      <span>{views} views</span>
    </div>
  </div>
</div>

        {/* Comments */}
        <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50">
          <CommentSection contentId={videoId} contentType="video" />
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
