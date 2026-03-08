import React, { useRef, useState, useEffect } from 'react';
import { X, Eye, Heart, Share2, Settings2 } from 'lucide-react';
import CommentSection from './CommentSection';
import { API } from '@/api';
import { getToken } from '@/utils/auth';
import { getAssetUrl } from '@/utils/url';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '@/lib/socket';

const QUALITY_PREFERENCE_KEY = 'huddleup_video_quality_preference';
const QUALITY_ORDER = ['1080p', '720p', '480p', '360p', 'original'];

const getAvailableQualities = (video) => {
  const versions = video?.videoVersions || {};
  const available = QUALITY_ORDER.filter((q) => versions[q]);
  // Always ensure "Auto" is available at the UI level
  return { versions, list: available };
};

const pickQualityForNetwork = (availableQualities) => {
  if (!availableQualities || availableQualities.length === 0) return null;

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const effectiveType = connection?.effectiveType;
  const downlink = connection?.downlink;

  // Very rough heuristic; can be tuned later
  if (effectiveType === 'slow-2g' || effectiveType === '2g' || (downlink && downlink < 1)) {
    return availableQualities.includes('360p')
      ? '360p'
      : availableQualities[availableQualities.length - 1];
  }

  if (effectiveType === '3g' || (downlink && downlink < 2.5)) {
    if (availableQualities.includes('480p')) return '480p';
    if (availableQualities.includes('360p')) return '360p';
    return availableQualities[availableQualities.length - 1];
  }

  // For 4g / unknown but decent connections, prefer 720p/1080p
  if (availableQualities.includes('720p')) return '720p';
  if (availableQualities.includes('1080p')) return '1080p';

  return availableQualities[0];
};

const loadQualityPreference = () => {
  try {
    const stored = localStorage.getItem(QUALITY_PREFERENCE_KEY);
    if (!stored) return 'Auto';
    return stored;
  } catch {
    return 'Auto';
  }
};

const saveQualityPreference = (value) => {
  try {
    localStorage.setItem(QUALITY_PREFERENCE_KEY, value);
  } catch {
    // ignore
  }
};

const VideoPlayer = ({ video, onClose }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [views, setViews] = useState(0);
  const [hasViewed, setHasViewed] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('Auto');
  const [currentQuality, setCurrentQuality] = useState(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const videoId = video._id || video.id;

  const { versions: videoVersions, list: availableQualities } = getAvailableQualities(video);

  // Initialize quality and source URL when video or versions change
  useEffect(() => {
    if (!video) return;

    const pref = loadQualityPreference();
    let effectiveQuality = pref;

    if (pref !== 'Auto' && !availableQualities.includes(pref)) {
      // Fallback if preferred quality not available for this video
      effectiveQuality = 'Auto';
    }

    if (effectiveQuality === 'Auto') {
      const autoQuality = pickQualityForNetwork(availableQualities) || null;
      setSelectedQuality('Auto');
      setCurrentQuality(autoQuality);
      const url =
        (autoQuality && videoVersions[autoQuality]) ||
        video.videoUrl ||
        null;
      setCurrentVideoUrl(url ? getAssetUrl(url) : null);
    } else {
      setSelectedQuality(effectiveQuality);
      setCurrentQuality(effectiveQuality);
      const url =
        videoVersions[effectiveQuality] ||
        video.videoUrl ||
        null;
      setCurrentVideoUrl(url ? getAssetUrl(url) : null);
    }
  }, [video, availableQualities, videoVersions]);

  // Handle quality change while preserving playback position
  const changeQuality = (quality) => {
    if (!video) return;

    saveQualityPreference(quality);
    setSelectedQuality(quality);

    // Compute the new target quality
    let targetQuality = quality;
    if (quality === 'Auto') {
      targetQuality = pickQualityForNetwork(availableQualities) || null;
    }

    setCurrentQuality(targetQuality);

    const rawUrl =
      (targetQuality && videoVersions[targetQuality]) ||
      video.videoUrl ||
      null;
    const newUrl = rawUrl ? getAssetUrl(rawUrl) : null;

    if (!videoRef.current || !newUrl) {
      setCurrentVideoUrl(newUrl);
      return;
    }

    const wasPlaying = !videoRef.current.paused && !videoRef.current.ended;
    const currentTime = videoRef.current.currentTime || 0;

    // Update src and try to keep position
    setCurrentVideoUrl(newUrl);

    // Wait for React to update the DOM, then adjust playback
    setTimeout(() => {
      if (!videoRef.current) return;
      try {
        videoRef.current.currentTime = currentTime;
        if (wasPlaying) {
          const playPromise = videoRef.current.play();
          if (playPromise && typeof playPromise.then === 'function') {
            playPromise.catch(() => {
              // autoplay might be blocked; ignore
            });
          }
        }
      } catch {
        // If seeking fails, ignore
      }
    }, 0);
  };

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

  useEffect(() => {
    if (!videoId) return;

    socket.connect();

    const roomPayload = { contentId: videoId, contentType: 'video' };
    socket.emit('join_content', roomPayload);

    const handleLikeUpdate = (payload) => {
      if (
        payload.contentType !== 'video' ||
        payload.contentId !== videoId
      ) {
        return;
      }
      if (typeof payload.likes === 'number') {
        setLikes(payload.likes);
      }
    };

    socket.on('content:like_toggled', handleLikeUpdate);

    return () => {
      socket.emit('leave_content', roomPayload);
      socket.off('content:like_toggled', handleLikeUpdate);
    };
  }, [videoId]);

  // Close modal on Escape key (#156)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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

  const [videoError, setVideoError] = useState(false);

  const onVideoError = () => {
    console.error("Video failed to load at:", currentVideoUrl);
    setVideoError(true);
    toast.error("Arena feed lost. Video failed to load.");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm p-4 md:p-10"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-zinc-200 dark:border-zinc-800"
          onClick={(e) => e.stopPropagation()}
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

            <div className="flex-1 flex items-center justify-center relative">
              {videoError ? (
                <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4 animate-pulse">
                    <Eye className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Connection Lost</h3>
                  <p className="text-zinc-500 text-sm max-w-[250px] font-bold uppercase tracking-widest leading-relaxed">
                    The arena feed is currently unavailable.
                  </p>
                  <Button
                    onClick={() => { setVideoError(false); if (videoRef.current) videoRef.current.load(); }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-black"
                  >
                    RETRY CONNECTION
                  </Button>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  key={currentVideoUrl || 'video-fallback-src'}
                  src={currentVideoUrl || getAssetUrl(video.videoUrl)}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onError={onVideoError}
                />
              )}
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

                {/* Quality Selector */}
                {availableQualities.length > 0 && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowQualityMenu((prev) => !prev)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs font-semibold hover:bg-white/10"
                    >
                      <Settings2 className="w-4 h-4" />
                      <span>
                        {selectedQuality === 'Auto'
                          ? 'Auto'
                          : currentQuality || selectedQuality}
                      </span>
                    </button>
                    {showQualityMenu && (
                      <div className="absolute mt-2 w-32 rounded-xl bg-zinc-900 text-white border border-white/10 shadow-xl overflow-hidden z-30">
                        <button
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 ${selectedQuality === 'Auto' ? 'bg-white/10' : ''
                            }`}
                          onClick={() => {
                            setShowQualityMenu(false);
                            changeQuality('Auto');
                          }}
                        >
                          Auto
                        </button>
                        {availableQualities.map((q) => (
                          <button
                            key={q}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 ${currentQuality === q && selectedQuality !== 'Auto'
                              ? 'bg-white/10'
                              : ''
                              }`}
                            onClick={() => {
                              setShowQualityMenu(false);
                              changeQuality(q);
                            }}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
