import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { motion } from 'framer-motion';
import PageWrapper from '@/components/ui/PageWrapper';
import PageMeta from '@/components/PageMeta';
import EmptyState from '@/components/ui/EmptyState';
import { TrendingUp, Clock, Flame, Globe, ChevronRight, Search, Play, User, Link2, Video, Bookmark, Eye, Heart, Plus } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import ShareMenu from '@/components/ui/ShareMenu';
import PlaylistManager from '@/components/PlaylistManager';
import AddToPlaylist from '@/components/AddToPlaylist';
import { API } from '@/api';
import { toast } from 'sonner';
import { getShareUrl, copyLinkToClipboard } from '@/utils/share';
import { getAssetUrl } from '@/utils/url';
import { useSaved } from '@/hooks/useSaved';
import FeedContainer from '@/components/FeedContainer';

const Explore = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isVideoSaved, toggleVideo, isLoggedIn } = useSaved();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // newest | views | likes
  const [allVideos, setAllVideos] = useState([]);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(null);
  const hasSearch = searchTerm.trim() !== '' || activeFilter !== 'ALL';
  const fetchInProgressRef = useRef(false);

  const fetchAllVideos = async () => {
    // Prevent duplicate requests
    if (fetchInProgressRef.current) return;
    
    fetchInProgressRef.current = true;
    try {
      const params = sortBy ? { sort: sortBy } : {};
      const res = await API.get("/videos", { params });
      setAllVideos(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      fetchInProgressRef.current = false;
    }
  };

  const getFilteredVideos = () => {
    return allVideos.filter((video) => {
      // Search filter
      const matchesSearch =
        searchTerm.trim() === '' ||
        video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory =
        activeFilter === 'ALL' || video.category === activeFilter;

      return matchesSearch && matchesCategory;
    });
  };

  useEffect(() => {
    fetchAllVideos();
  }, [sortBy]);

  useEffect(() => {
    if (location.pathname === "/explore") fetchAllVideos();
  }, [location.pathname]);

  // Handle search parameter from URL (e.g., from hashtag links)
  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  const shareVideoId = searchParams.get('video');
  useEffect(() => {
    if (!shareVideoId || allVideos.length === 0) return;
    const video = allVideos.find((v) => (v._id || v.id) === shareVideoId);
    if (video) setSelectedVideo(video);
  }, [shareVideoId, allVideos]);

  const handleVideoClick = (video) => setSelectedVideo(video);
  const handleClosePlayer = () => setSelectedVideo(null);

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

  const getCategoryCount = (category) => {
    if (category === 'ALL') return allVideos.length;
    return allVideos.filter(v => v.category === category).length;
  };

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
    return (
      <video
        src={src}
        muted
        playsInline
        preload="metadata"
        className="w-full h-full object-cover"
        style={compact ? { borderRadius: 'var(--r-lg)' } : undefined}
        onError={() => console.error('Failed to load video thumbnail from', src)}
      />
    );
  };

  const renderVideoCard = (video) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          scale: 1.03,
          y: -4,
          boxShadow: "0px 10px 40px rgba(0, 229, 255, 0.15)",
          transition: { duration: 0.25 }
        }}
        className="relative group cursor-pointer overflow-hidden rounded-xl mb-4"
        onClick={() => handleVideoClick(video)}
        style={{
          height: '320px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div className="absolute inset-0">
          <VideoThumbnail video={video} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

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
            onClick={(e) => {
              e.stopPropagation();
              if (!isLoggedIn) {
                toast.error('Login to add to playlist');
                return;
              }
              setShowAddToPlaylist(video._id || video.id);
            }}
            className="p-2 rounded-lg transition-opacity hover:opacity-100 opacity-90"
            style={{
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
            title="Add to playlist"
          >
            <Plus className="w-4 h-4" />
          </button>
          <ShareMenu 
            url={getShareUrl('video', video._id || video.id)}
            title={video.title}
            description={video.description}
          />
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
            {video.views != null && (
              <>
                <span>•</span>
                <span>{video.views} views</span>
              </>
            )}
            {video.commentsCount != null && (
              <>
                <span>•</span>
                <span>{video.commentsCount} comments</span>
              </>
            )}
          </div>
        </div>

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
    );
  };

  const pageTitle = selectedVideo ? selectedVideo.title : 'Explore Sports Universe';
  const pageDescription = selectedVideo
    ? (selectedVideo.description || `Watch ${selectedVideo.title} on HuddleUp`)
    : 'Discover sports videos, match analysis, and stories from around the globe.';

  return (
    <PageWrapper>
      <PageMeta title={pageTitle} description={pageDescription} />
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="px-6 md:px-12 pt-12 pb-8"
        >
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-black mb-4" style={{ color: 'var(--text-main)' }}>
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

            <div className="rounded-2xl p-6 md:p-8"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)'
              }}
            >
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

            {/* Sort options: Newest (default), Most viewed, Most liked */}
            <div className="flex flex-wrap items-center gap-2 mt-6">
              <span className="text-sm font-medium mr-1" style={{ color: 'var(--text-sub)' }}>Sort by:</span>
              {[
                { key: 'newest', label: 'Newest', icon: Clock },
                { key: 'views', label: 'Most viewed', icon: Eye },
                { key: 'likes', label: 'Most liked', icon: Heart },
              ].map((opt) => {
                const isActive = sortBy === opt.key;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setSortBy(opt.key)}
                    className="px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 transition-all"
                    style={{
                      background: isActive ? 'var(--accent)' : 'var(--bg-primary)',
                      color: isActive ? 'var(--bg-primary)' : 'var(--text-sub)',
                      border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border-subtle)'}`,
                      transform: isActive ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="px-6 md:px-12 pb-16"
        >
          <div className="max-w-7xl mx-auto">
            {/* Playlist Manager Section */}
            {isLoggedIn && <PlaylistManager />}
            
            {hasSearch ? (
              (() => {
                const filteredVideos = getFilteredVideos();
                if (filteredVideos.length === 0) {
                  return (
                    <EmptyState
                      icon={Video}
                      title={allVideos.length === 0 ? 'No videos yet' : 'No results found'}
                      description={
                        allVideos.length === 0
                          ? 'Upload your first video to get started and share it with the community.'
                          : searchTerm
                            ? `No videos match "${searchTerm}". Try different keywords or clear the search.`
                            : 'No videos in this category. Try another filter or clear filters to see all.'
                      }
                      actionLabel={allVideos.length === 0 ? 'Upload your first video' : undefined}
                      actionHref={allVideos.length === 0 ? '/upload' : undefined}
                    />
                  );
                }
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredVideos.map((video) => (
                      <div key={video._id}>{renderVideoCard(video)}</div>
                    ))}
                  </div>
                );
              })()
            ) : (
              <FeedContainer
                contentType="video"
                category={activeFilter !== 'ALL' ? activeFilter : undefined}
                renderItem={(item) => (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {renderVideoCard(item)}
                  </div>
                )}
              />
            )}
          </div>
        </motion.div>

        {selectedVideo && (
          <VideoPlayer
            video={selectedVideo}
            onClose={handleClosePlayer}
          />
        )}

        {/* Add to Playlist Modal */}
        {showAddToPlaylist && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md" style={{ background: 'var(--bg-surface)' }}>
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <h3 className="font-semibold" style={{ color: 'var(--text-main)' }}>
                  Add to Playlist
                </h3>
                <button
                  onClick={() => setShowAddToPlaylist(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                  style={{ color: 'var(--text-sub)' }}
                >
                  ×
                </button>
              </div>
              <AddToPlaylist
                videoId={showAddToPlaylist}
                onClose={() => setShowAddToPlaylist(null)}
              />
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Explore;
