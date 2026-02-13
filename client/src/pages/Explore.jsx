// Explore.jsx
import React, { useState, useEffect } from 'react';
import { Search, Grid3x3, LayoutList, SlidersHorizontal, TrendingUp, Clock, Eye } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import VideoCard from '@/components/VideoCard';
import CategoryFilter from '@/components/CategoryFilter';
import VideoPlayer from '@/components/VideoPlayer';
import { API } from '@/api';

const Explore = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [videoCounts, setVideoCounts] = useState({});
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  const fetchVideos = async () => {
    try {
      const res = await API.get("/videos");
      const allVideos = Array.isArray(res.data) ? res.data : [];
      setVideos(allVideos);
      setFilteredVideos(allVideos);

      const counts = {
        ALL: allVideos.length,
        "UNHEARD STORIES": allVideos.filter(
          (v) => v?.category === "UNHEARD STORIES"
        ).length,
        "MATCH ANALYSIS": allVideos.filter(
          (v) => v?.category === "MATCH ANALYSIS"
        ).length,
        "SPORTS AROUND THE GLOBE": allVideos.filter(
          (v) => v?.category === "SPORTS AROUND THE GLOBE"
        ).length,
      };

      setVideoCounts(counts);
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

  // Open video when opening a shared link (e.g. /explore?video=id)
  const shareVideoId = searchParams.get('video');
  useEffect(() => {
    if (!shareVideoId || videos.length === 0) return;
    const video = videos.find((v) => (v._id || v.id) === shareVideoId);
    if (video) setSelectedVideo(video);
  }, [shareVideoId, videos]);

  useEffect(() => {
    let filtered = [...videos];

    if (selectedCategory !== "ALL") {
      filtered = filtered.filter(
        (video) => video.category === selectedCategory
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (video) =>
          video?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video?.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVideos(filtered);
  }, [videos, selectedCategory, searchTerm]);

  const handleVideoPlay = (video) => {
    if (!video) return;
    setSelectedVideo(video);
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
  };

  // Group videos by category for Netflix-style rows
  const categorizedVideos = {
    "Trending Now": filteredVideos.slice(0, 8),
    "UNHEARD STORIES": videos.filter(v => v?.category === "UNHEARD STORIES"),
    "MATCH ANALYSIS": videos.filter(v => v?.category === "MATCH ANALYSIS"),
    "SPORTS AROUND THE GLOBE": videos.filter(v => v?.category === "SPORTS AROUND THE GLOBE"),
    "Recently Added": videos.slice(-8).reverse()
  };

  const categories = [
    { name: "ALL", icon: "🏆", count: videoCounts.ALL },
    { name: "UNHEARD STORIES", icon: "📢", count: videoCounts["UNHEARD STORIES"] },
    { name: "MATCH ANALYSIS", icon: "📊", count: videoCounts["MATCH ANALYSIS"] },
    { name: "SPORTS AROUND THE GLOBE", icon: "🌍", count: videoCounts["SPORTS AROUND THE GLOBE"] }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Netflix-style Top Bar */}
      <div className="sticky top-16 z-40 border-b" style={{ 
        background: 'var(--bg-overlay)', 
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--border-subtle)'
      }}>
        <div className="max-w-[1800px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Title */}
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
              Explore
            </h1>

            {/* Center: Search */}
            <div className="flex-1 max-w-xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search videos, stories, analysis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  fontSize: 'var(--text-base)',
                  outline: 'none',
                  transition: 'all var(--transition-base)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
              />
            </div>

            {/* Right: View Toggle */}
            <div className="flex items-center gap-2 p-1 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
              <button
                onClick={() => setViewMode('grid')}
                className="p-2 rounded transition-all"
                style={{
                  background: viewMode === 'grid' ? 'var(--accent)' : 'transparent',
                  color: viewMode === 'grid' ? 'white' : 'var(--text-sub)'
                }}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="p-2 rounded transition-all"
                style={{
                  background: viewMode === 'list' ? 'var(--accent)' : 'transparent',
                  color: viewMode === 'list' ? 'white' : 'var(--text-sub)'
                }}
              >
                <LayoutList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Notion-style Sidebar + Netflix Rows */}
      <div className="flex">
        {/* Sidebar - Notion-style filters */}
        <aside className="hidden lg:block w-64 border-r sticky top-32 h-screen overflow-y-auto scrollbar-custom" 
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6" style={{ color: 'var(--text-sub)' }}>
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wide">Filters</span>
            </div>

            {/* Category List */}
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className="w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between group"
                  style={{
                    background: selectedCategory === cat.name ? 'var(--bg-elevated)' : 'transparent',
                    color: selectedCategory === cat.name ? 'var(--text-main)' : 'var(--text-sub)',
                    fontWeight: selectedCategory === cat.name ? 'var(--fw-semibold)' : 'var(--fw-regular)',
                    border: selectedCategory === cat.name ? '1px solid var(--border-medium)' : '1px solid transparent'
                  }}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-sm">{cat.name}</span>
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full" style={{
                    background: selectedCategory === cat.name ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: selectedCategory === cat.name ? 'white' : 'var(--text-muted)'
                  }}>
                    {cat.count || 0}
                  </span>
                </button>
              ))}
            </div>

            {/* Stats Section */}
            <div className="mt-8 p-4 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-sub)' }}>STATISTICS</div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" style={{ color: 'var(--accent-2)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-main)' }}>{videos.length} Total Videos</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent-success)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-main)' }}>{filteredVideos.length} Showing</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          {/* Hero Featured Video */}
          {filteredVideos.length > 0 && (
            <div className="relative h-[420px] mb-12 cursor-pointer group" onClick={() => handleVideoPlay(filteredVideos[0])}>
              <div className="absolute inset-0" style={{
                background: `linear-gradient(to bottom, transparent 0%, var(--bg-primary) 100%), 
                             linear-gradient(to right, var(--bg-primary) 0%, transparent 50%),
                             url(${filteredVideos[0].thumbnail || '/placeholder.jpg'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} />
              <div className="relative h-full flex items-end p-12 max-w-[1800px] mx-auto">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{
                      background: 'var(--accent)',
                      color: 'white'
                    }}>
                      FEATURED
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-sub)' }}>
                      {filteredVideos[0].category}
                    </span>
                  </div>
                  <h2 className="text-5xl font-bold mb-4 group-hover:text-gradient-accent transition-all" style={{ 
                    color: 'var(--text-main)',
                    lineHeight: 'var(--lh-tight)'
                  }}>
                    {filteredVideos[0].title}
                  </h2>
                  <p className="text-lg mb-6 line-clamp-2" style={{ color: 'var(--text-sub)' }}>
                    {filteredVideos[0].description || "Watch this featured content"}
                  </p>
                  <button className="px-8 py-3 rounded-lg font-semibold flex items-center gap-2" style={{
                    background: 'white',
                    color: 'var(--bg-primary)',
                    transition: 'all var(--transition-base)'
                  }}>
                    <Eye className="w-5 h-5" />
                    Watch Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Netflix-style Category Rows */}
          {filteredVideos.length > 0 ? (
            <div className="px-8 pb-16 space-y-12">
              {selectedCategory === "ALL" ? (
                // Show all categories as rows
                Object.entries(categorizedVideos).map(([categoryName, categoryVideos]) => (
                  categoryVideos.length > 0 && (
                    <div key={categoryName}>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
                          {categoryName}
                        </h3>
                        <button 
                          onClick={() => {
                            if (categoryName === "Trending Now" || categoryName === "Recently Added") return;
                            setSelectedCategory(categoryName);
                          }}
                          className="text-sm font-semibold hover:underline"
                          style={{ color: 'var(--accent)' }}
                        >
                          View All →
                        </button>
                      </div>
                      <div className="flex gap-6 overflow-x-auto scrollbar-custom pb-4">
                        {categoryVideos.slice(0, 6).map((video) => (
                          <div key={video._id} className="flex-shrink-0 w-[320px]">
                            <VideoCard
                              video={{
                                ...video,
                                id: video._id,
                                videoUrl: video.videoUrl?.startsWith("/uploads")
                                  ? `http://localhost:5000${video.videoUrl}`
                                  : video.videoUrl,
                              }}
                              onPlay={handleVideoPlay}
                              onDelete={(id) =>
                                setVideos((prev) => prev.filter((v) => v._id !== id))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))
              ) : (
                // Show filtered category in tight grid
                <div>
                  <h3 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-main)' }}>
                    {selectedCategory}
                    <span className="ml-4 text-lg font-normal" style={{ color: 'var(--text-sub)' }}>
                      {filteredVideos.length} videos
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredVideos.map((video) => (
                      <VideoCard
                        key={video._id}
                        video={{
                          ...video,
                          id: video._id,
                          videoUrl: video.videoUrl?.startsWith("/uploads")
                            ? `http://localhost:5000${video.videoUrl}`
                            : video.videoUrl,
                        }}
                        onPlay={handleVideoPlay}
                        onDelete={(id) =>
                          setVideos((prev) => prev.filter((v) => v._id !== id))
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-32 h-32 rounded-2xl flex items-center justify-center mb-6" style={{
                background: 'var(--bg-elevated)',
                border: '2px dashed var(--border-medium)'
              }}>
                <Search className="w-16 h-16" style={{ color: 'var(--text-muted)' }} />
              </div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>
                No Videos Found
              </h2>
              <p className="text-lg mb-8 max-w-md" style={{ color: 'var(--text-sub)' }}>
                Be the first to upload an exciting sports video and inspire the community.
              </p>
              <button
                onClick={() => navigate("/upload")}
                className="px-8 py-4 rounded-lg font-semibold"
                style={{
                  background: 'var(--accent)',
                  color: 'white',
                  transition: 'all var(--transition-base)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Upload Your First Video
              </button>
            </div>
          )}
        </main>
      </div>

      {selectedVideo && (
        <VideoPlayer video={selectedVideo} onClose={handleClosePlayer} />
      )}
    </div>
  );
};

export default Explore;
