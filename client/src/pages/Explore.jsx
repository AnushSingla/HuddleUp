// Explore.jsx
import React, { useState, useEffect } from 'react';
import { Search, Compass, Mic2, BarChart3, Globe, PlayCircle } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import VideoCard from '@/components/VideoCard';
import VideoPlayer from '@/components/VideoPlayer';
import { SkeletonCard } from '@/utils/skeletonCard';
import { API } from '@/api';
import { getAssetUrl } from '@/utils/url';

const Explore = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, isLoading] = useState(false)
  const [videoCounts, setVideoCounts] = useState({});
  const [selectedVideo, setSelectedVideo] = useState(null);

  const fetchVideos = async () => {
    try {
      isLoading(true) // set loading state while fetching videos and show skeletonCard
      const res = await API.get("/videos");
      if(res.data) isLoading(false); // set loading to false if data received
     console.log(res.data)
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

  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-500 overflow-hidden">
      {/* ======= BACKGROUND GLOW EFFECT ======= */}
      <div className="absolute -top-40 -left-20 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* ================= HEADER ================= */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Discover Content
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
          >
            Explore <span className="bg-gradient-to-r from-emerald-500 to-indigo-600 bg-clip-text text-transparent">Sports Universe</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Immerse yourself in world-class sports stories, expert analysis, and exclusive highlights from across the globe.
          </motion.p>
        </div>

        {/* ================= SEARCH + FILTER ================= */}
        <div className="w-full max-w-5xl mx-auto mb-16">
          <div className="bg-white/70 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl shadow-indigo-500/5">
            {/* SEARCH */}
            <div className="relative max-w-2xl mx-auto mb-8 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by title, athlete, or sport..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 
                bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-400
                focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50
                transition-all duration-300 shadow-sm group-hover:shadow-md"
              />
            </div>

            {/* CATEGORIES */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { name: "ALL", icon: <PlayCircle className="w-4 h-4" />, count: videoCounts.ALL },
                { name: "UNHEARD STORIES", icon: <Mic2 className="w-4 h-4" />, count: videoCounts["UNHEARD STORIES"] },
                { name: "MATCH ANALYSIS", icon: <BarChart3 className="w-4 h-4" />, count: videoCounts["MATCH ANALYSIS"] },
                { name: "SPORTS AROUND THE GLOBE", icon: <Globe className="w-4 h-4" />, count: videoCounts["SPORTS AROUND THE GLOBE"] },
              ].map((cat, idx) => (
                <motion.button
                  key={cat.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-300 
                  border font-medium text-xs
                  ${selectedCategory === cat.name
                      ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/25"
                      : "bg-white dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10"
                    }`}
                >
                  <span className={`${selectedCategory === cat.name ? "text-white" : "text-emerald-500"}`}>
                    {cat.icon}
                  </span>
                  <span>{cat.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold
                    ${selectedCategory === cat.name
                        ? "bg-white/20 text-white"
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                      }`}
                  >
                    {cat.count || 0}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= VIDEO GRID ================= */}
        
        { // if loading state is true, show skelton otherwise videos or nothing to show videos ( msg )
         loading ?
         <SkeletonCard/>
         :
         ( filteredVideos.length > 0 && !loading ? 
           (  <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
          >
            { filteredVideos.map((video) => (
              <VideoCard
                key={video._id}
                video={{
                  ...video,
                  id: video._id,
                }}
                onPlay={handleVideoPlay}
                onDelete={(id) =>
                  setVideos((prev) => prev.filter((v) => v._id !== id))
                }
              />
            ))}
          </motion.div>) 
          :
           (
          <div className="relative flex flex-col items-center justify-center py-24 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-8"
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-indigo-600 flex items-center justify-center shadow-2xl">
                <span className="text-4xl text-white">🎬</span>
              </div>
            </motion.div>

            <h2 className="text-3xl font-bold mb-4">No content found</h2>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-10">
              We couldn't find any videos matching your search or category. Try something else!
            </p>

            <button
              onClick={() => navigate("/upload")}
              className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition shadow-lg shadow-emerald-500/20"
            >
              Upload New Video
            </button>
          </div>
        )
        ) }

        {selectedVideo && (
          <VideoPlayer video={selectedVideo} onClose={handleClosePlayer} />
        )}
      </div>
    </div>
  );
};

export default Explore;
