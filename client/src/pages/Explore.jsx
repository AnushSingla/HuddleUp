import React, { useState, useEffect } from 'react';
import { useNavigate,useLocation, useSearchParams } from "react-router-dom";
import { motion } from 'framer-motion';
import VideoPlayer from '@/components/VideoPlayer';
import { API } from '@/api';

const Explore = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedVideo, setSelectedVideo] = useState(null);

  const categories = [
    "ALL",
    "UNHEARD STORIES",
    "MATCH ANALYSIS",
    "SPORTS AROUND THE GLOBE"
  ];

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

  const filteredVideos = selectedCategory === "ALL" 
    ? videos 
    : videos.filter(v => v.category === selectedCategory);

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
  };

  // Generate random heights for masonry effect
  const getRandomHeight = (index) => {
    const heights = ['300px', '350px', '400px', '450px', '380px'];
    return heights[index % heights.length];
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      
      {/* Horizontal Pill Filter Bar */}
      <div className="sticky top-16 z-20 px-6 md:px-12 py-6 border-b backdrop-blur-xl"
        style={{
          background: 'rgba(11, 13, 26, 0.8)',
          borderColor: 'var(--border-subtle)'
        }}>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-6 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all"
              style={{
                background: selectedCategory === cat ? 'var(--accent)' : 'transparent',
                color: selectedCategory === cat ? 'var(--bg-primary)' : 'var(--text-sub)',
                border: selectedCategory === cat ? 'none' : '1px solid var(--border-subtle)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry Grid - Pinterest Style */}
      <div className="px-6 md:px-12 py-8">
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4"
          style={{ columnGap: '1rem' }}>
          {filteredVideos.map((video, index) => (
            <motion.div
              key={video._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative group cursor-pointer break-inside-avoid mb-4"
              onClick={() => handleVideoClick(video)}
              style={{
                height: getRandomHeight(index),
                borderRadius: 'var(--r-md)',
                overflow: 'hidden'
              }}
            >
              {/* Video Thumbnail */}
              <div className="absolute inset-0">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"
                    style={{ background: 'var(--bg-secondary)' }}>
                    <span style={{ color: 'var(--text-sub)' }}>No Preview</span>
                  </div>
                )}
              </div>

              {/* Hover Overlay - Title Appears */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent 
                opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-bold text-white mb-1 line-clamp-2">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <span>by {video.uploadedBy?.username || 'Unknown'}</span>
                    {video.views && (
                      <>
                        <span>·</span>
                        <span>{video.views} views</span>
                      </>
                    )}
                  </div>
                  
                  {/* Category Badge */}
                  {video.category && (
                    <div className="mt-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: 'rgba(0, 229, 255, 0.2)',
                          color: 'var(--accent)'
                        }}>
                        {video.category}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Play Icon - Center (visible on hover) */}
              <div className="absolute inset-0 flex items-center justify-center
                opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(0, 229, 255, 0.9)',
                    color: 'var(--bg-primary)'
                  }}>
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-20">
            <p style={{ color: 'var(--text-sub)' }}>No videos found</p>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={handleClosePlayer}
        />
      )}
    </div>
  );
};

export default Explore;
