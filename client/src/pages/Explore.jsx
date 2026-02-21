import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { motion } from 'framer-motion';
import PageWrapper from '@/components/ui/PageWrapper';
import EmptyState from '@/components/ui/EmptyState';
import { TrendingUp, Clock, Flame, Globe, ChevronRight, Search, Play, User, Link2, Video, Bookmark } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import { API } from '@/api';
import { toast } from 'sonner';
import { getShareUrl, copyLinkToClipboard } from '@/utils/share';
import { getAssetUrl } from '@/utils/url';
import { useSaved } from '@/hooks/useSaved';

const Explore = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isVideoSaved, toggleVideo, isLoggedIn } = useSaved();
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const fetchVideos = async () => {
    try {
      const res = await API.get("/videos");
      const allVideos = Array.isArray(res.data) ? res.data : [];
      setVideos(allVideos);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (location.pathname === "/explore") fetchVideos();
  }, [location.pathname]);

  // Open video when sharing link
  const shareVideoId = searchParams.get('video');
  useEffect(() => {
    if (!shareVideoId || videos.length === 0) return;
    const video = videos.find((v) => (v._id || v.id) === shareVideoId);
    if (video) setSelectedVideo(video);
  }, [shareVideoId, videos]);

  // Editorial Grouping Logic
  const getRecentVideos = () => videos.slice(0, 8);
  const getTrendingVideos = () => videos.filter((v, idx) => idx % 3 === 0).slice(0, 6);
  const getMatchAnalysis = () => videos.filter(v => v.category === "MATCH ANALYSIS");
  const getGlobalStories = () => videos.filter(v => v.category === "SPORTS AROUND THE GLOBE");
  const getUnheardStories = () => videos.filter(v => v.category === "UNHEARD STORIES");

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
  };

  const handleCopyLink = (e, video) => {
    e.stopPropagation();
    const videoId = video._id || video.id;
    if (!videoId) return;
    const url = getShareUrl('video', videoId);
    copyLinkToClipboard(
      url,
      (msg) => toast.success(msg),
      (msg) => toast.error(msg)
    );
  };

  // Category counts
  const getCategoryCount = (category) => {
    if (category === 'ALL') return videos.length;
    return videos.filter(v => v.category === category).length;
  };

  // Filtered videos based on search and category
  const getFilteredVideos = () => {
    let filtered = videos;
    
    // Apply category filter
    if (activeFilter !== 'ALL') {
      filtered = filtered.filter(v => v.category === activeFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(v => 
        v.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.uploadedBy?.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredVideos = getFilteredVideos();

  // Reusable thumbnail renderer so Explore cards always
  // show a playable-looking preview using the actual video file.
  const VideoThumbnail = ({ video, compact = false }) => {
    const hasVideo = !!video.videoUrl;
    if (!hasVideo) {
      return (
        <div className="w-full h-full flex items-center justify-center"
          style={{ background: 'var(--bg-surface)' }}>
          <span style={{ color: 'var(--text-sub)' }}>No Preview</span>
        </div>
      );
    }

    const src = getAssetUrl(video.videoUrl);

    // We intentionally do not mutate the DOM here; if the video
    // fails to load, the browser will show its default error UI
    // and the console log will help us debug.
    return (
      <video
        src={src}
        muted
        playsInline
        preload="metadata"
        className="w-full h-full object-cover"
        style={compact ? { borderRadius: 'var(--r-lg)' } : undefined}
        onError={() => {
          console.error('Failed to load video thumbnail from', src);
        }}
      />
    );
  };

  // Editorial Section Component
  const EditorialSection = ({ title, icon: Icon, videos, accent = 'var(--accent)' }) => {
    if (!videos || videos.length === 0) return null;
    
    return (
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: `${accent}20` }}>
              <Icon className="w-5 h-5" style={{ color: accent }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
              {title}
            </h2>
          </div>
          <button className="flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all"
            style={{ color: accent }}>
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.slice(0, 4).map((video, index) => (
            <motion.div
              key={video._id || index}
              initial={{ opacity: 0, y: 20, boxShadow: "0px 0px 0px rgba(0,0,0,0)" }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{
                scale: 1.03,
                y: -4,
                boxShadow: "0px 10px 40px rgba(0, 229, 255, 0.15)",
                transition: { duration: 0.25 }
              }}
              className="relative group cursor-pointer overflow-hidden content-elevated focus-elevated"
              onClick={() => handleVideoClick(video)}
              style={{
                height: '280px',
                borderRadius: 'var(--r-lg)'
              }}
            >
              {/* Thumbnail */}
              <div className="absolute inset-0">
                <VideoThumbnail video={video} compact />
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

              {/* Save - top right */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isLoggedIn) {
                    toast.error('Login to save videos');
                    return;
                  }
                  toggleVideo(video._id || video.id);
                }}
                className="absolute top-3 right-3 z-10 p-2 rounded-lg transition-opacity hover:opacity-100 opacity-90"
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  color: isVideoSaved(video._id) ? 'var(--turf-green)' : 'white',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
                title={isVideoSaved(video._id) ? 'Unsave' : 'Save for later'}
              >
                <Bookmark className={`w-4 h-4 ${isVideoSaved(video._id) ? 'fill-current' : ''}`} />
              </button>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-bold text-white mb-2 line-clamp-2">
                  {video.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <span>by {video.uploadedBy?.username || video.postedBy?.username || 'Unknown'}</span>
                  {video.views && (
                    <>
                      <span>·</span>
                      <span>{video.views} views</span>
                    </>
                  )}
                </div>
              </div>

              {/* Play Icon - Center */}
              <div className="absolute inset-0 flex items-center justify-center
                opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: accent,
                    color: 'var(--bg-primary)'
                  }}>
                  <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <PageWrapper>
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      
      {/* Hero Header */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-6 md:px-12 pt-12 pb-8"
      >
        <div className="max-w-7xl mx-auto">
          {/* Discover Content Button */}
          <div className="flex justify-end mb-8">
            <button
              className="px-4 py-2 rounded-full flex items-center gap-2 font-medium text-sm"
              style={{
                background: 'var(--turf-green)',
                color: 'var(--bg-primary)',
                border: '2px solid var(--turf-green)'
              }}
            >
              <span>●</span> Discover Content
            </button>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-4" style={{ color: 'var(--ice-white)' }}>
            Explore{' '}
            <span style={{
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Sports Universe
            </span>
          </h1>
          <p className="text-lg max-w-3xl mb-8" style={{ color: 'var(--text-sub)' }}>
            Immerse yourself in world-class sports stories, expert analysis, and exclusive highlights from across the globe.
          </p>

          {/* Search and Filters Card */}
          <div className="rounded-2xl p-6 md:p-8"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" 
                  style={{ color: 'var(--text-sub)' }} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, athlete, or sport..."
                  className="w-full pl-12 pr-4 py-3 rounded-lg outline-none transition-all"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '2px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontSize: 'var(--text-base)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'ALL', label: 'All', icon: '⚡' },
                { key: 'UNHEARD STORIES', label: 'Unheard Stories', icon: '🎙️' },
                { key: 'MATCH ANALYSIS', label: 'Match Analysis', icon: '📊' },
                { key: 'SPORTS AROUND THE GLOBE', label: 'Sports Around The Globe', icon: '🌍' }
              ].map((filter) => {
                const count = getCategoryCount(filter.key);
                const isActive = activeFilter === filter.key;
                
                return (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    className="px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 transition-all"
                    style={{
                      background: isActive ? 'var(--turf-green)' : 'var(--bg-primary)',
                      color: isActive ? 'var(--bg-primary)' : 'var(--text-sub)',
                      border: `2px solid ${isActive ? 'var(--turf-green)' : 'var(--border-subtle)'}`,
                      transform: isActive ? 'scale(1.05)' : 'scale(1)'
                    }}
                  >
                    <span>{filter.icon}</span>
                    <span>{filter.label}</span>
                    <span className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                      style={{
                        background: isActive ? 'rgba(0,0,0,0.2)' : 'var(--border-subtle)',
                        color: isActive ? 'var(--bg-primary)' : 'var(--text-main)'
                      }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Video Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="px-6 md:px-12 pb-16"
      >
        <div className="max-w-7xl mx-auto">
          {filteredVideos.length === 0 ? (
            <EmptyState
              icon={Video}
              title={videos.length === 0 ? 'No videos yet' : 'No results found'}
              description={
                videos.length === 0
                  ? 'Upload your first video to get started and share it with the community.'
                  : searchTerm
                    ? `No videos match "${searchTerm}". Try different keywords or clear the search.`
                    : 'No videos in this category. Try another filter or clear filters to see all.'
              }
              actionLabel={videos.length === 0 ? 'Upload your first video' : undefined}
              actionHref={videos.length === 0 ? '/upload' : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{
                    scale: 1.03,
                    y: -4,
                    boxShadow: "0px 10px 40px rgba(0, 229, 255, 0.15)",
                    transition: { duration: 0.25 }
                  }}
                  className="relative group cursor-pointer overflow-hidden rounded-xl"
                  onClick={() => handleVideoClick(video)}
                  style={{
                    height: '320px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {/* Thumbnail */}
                  <div className="absolute inset-0">
                    <VideoThumbnail video={video} />
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                  {/* Category Badge */}
                  {video.category && (
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                        style={{
                          background: video.category === 'UNHEARD STORIES' ? 'var(--turf-green)' :
                                     video.category === 'MATCH ANALYSIS' ? '#3b82f6' :
                                     'var(--accent)',
                          color: 'white'
                        }}>
                        {video.category === 'UNHEARD STORIES' ? '🎙️ Unheard Stories' :
                         video.category === 'MATCH ANALYSIS' ? '📊 Match Analysis' :
                         video.category === 'SPORTS AROUND THE GLOBE' ? '🌍 Sports Globe' :
                         video.category}
                      </span>
                    </div>
                  )}

                  {/* Top right: Save + Copy link */}
                  <div className="absolute top-3 right-3 z-10 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isLoggedIn) {
                          toast.error('Login to save videos');
                          return;
                        }
                        toggleVideo(video._id || video.id);
                      }}
                      className="p-2 rounded-lg transition-opacity hover:opacity-100 opacity-90"
                      style={{
                        background: 'rgba(0,0,0,0.6)',
                        color: isVideoSaved(video._id) ? 'var(--turf-green)' : 'white',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                      title={isVideoSaved(video._id) ? 'Unsave' : 'Save for later'}
                    >
                      <Bookmark className={`w-4 h-4 ${isVideoSaved(video._id) ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => handleCopyLink(e, video)}
                      className="p-2 rounded-lg transition-opacity hover:opacity-100 opacity-90"
                      style={{
                        background: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                      title="Copy link"
                    >
                      <Link2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-bold text-white mb-2 line-clamp-2">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-sm text-white/70 mb-2 line-clamp-1">
                        {video.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-white/60 mb-3">
                      <span
                        className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          const slug = video.postedBy?.username || video.uploadedBy?.username || video.postedBy?._id || video.postedBy;
                          if (slug) navigate(`/user/${encodeURIComponent(slug)}`);
                        }}
                      >
                        <User className="w-3 h-3" />
                        {video.postedBy?.username || video.uploadedBy?.username || 'Unknown'}
                      </span>
                      {video.createdAt && (
                        <>
                          <span>•</span>
                          <span>{new Date(video.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}</span>
                        </>
                      )}
                      {video.views && (
                        <>
                          <span>•</span>
                          <span>{video.views} views</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Play Button - Center */}
                  <div className="absolute inset-0 flex items-center justify-center
                    opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: 'var(--turf-green)',
                        color: 'white'
                      }}>
                      <Play className="w-8 h-8 ml-1" fill="currentColor" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={handleClosePlayer}
        />
      )}
    </div>
    </PageWrapper>
  );
};

export default Explore;
