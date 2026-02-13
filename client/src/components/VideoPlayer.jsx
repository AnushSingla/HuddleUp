import React, { useRef, useState, useEffect } from 'react';
import { X, Eye, Heart, Share2 } from 'lucide-react';
import CommentSection from './CommentSection';
import { API } from '@/api';
import { getToken } from '@/utils/auth';
import { getAssetUrl } from '@/utils/url';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const VideoPlayer = ({ video, onClose }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [views, setViews] = useState(0);
  const [hasViewed, setHasViewed] = useState(false);
  const videoId = video._id || video.id;

  const videoUrl = getAssetUrl(video.videoUrl);

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
    const token = getToken();
    if (!token) {
      toast.error("Please login first to like videos");
      return;
    }

    try {
      const res = await API.post(
        `/videos/${videoId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLiked(res.data.liked);
      setLikes(res.data.likes);
    } catch (err) {
      console.error('Failed to toggle like:', err);
      if (err.response?.status === 401) {
        toast.error("Please login first to like videos");
      } else {
        toast.error("Failed to like video. Please try again.");
      }
    }
  };

  const handleShare = async () => {
    if (!videoId) return;
    const url = getShareUrl('video', videoId);
    await shareLink(
      url,
      video.title || 'Video on HuddleUp',
      video.description?.slice(0, 100) || '',
      (msg) => toast.success(msg),
      (msg) => toast.error(msg)
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm p-4 md:p-10"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-zinc-200 dark:border-zinc-800"
        >
          {/* Left Side: Video Content */}
          <div className="flex-[1.5] flex flex-col bg-black relative">
            {/* Header Overlay (Mobile/Small) - Hidden on larger screens if desired */}
            <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start pointer-events-none">
              <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 pointer-events-auto">
                <h2 className="text-sm font-bold text-white line-clamp-1">{video.title}</h2>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{video.category}</p>
              </div>
              <button
                onClick={onClose}
                className="p-3 bg-black/40 backdrop-blur-md text-white hover:bg-white/20 rounded-2xl border border-white/10 transition pointer-events-auto"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>

            {/* Bottom Actions Overlay */}
            <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-4 pointer-events-auto">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md border transition-all ${isLiked
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-black/40 border-white/10 text-white hover:bg-white/10'
                    }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-xs font-bold">{likes}</span>
                </button>

                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs font-bold">{views} Views</span>
                </div>
              </div>

              <div className="pointer-events-auto">
                <button
                  onClick={handleShare}
                  className="p-3 bg-black/40 backdrop-blur-md text-white hover:bg-white/10 rounded-xl border border-white/10 transition shadow-xl"
                  title="Share video"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Discussions */}
          <div className="flex-1 flex flex-col bg-zinc-50 dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 italic">Debate Arena</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">Join the global sports conversation</p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-6">
                <CommentSection contentId={videoId} contentType="video" />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoPlayer;
