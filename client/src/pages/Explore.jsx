import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import VideoCard from "@/components/VideoCard";
import CategoryFilter from "@/components/CategoryFilter";
import VideoPlayer from "@/components/VideoPlayer";
import { API } from "@/api";

const Explore = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [videoCounts, setVideoCounts] = useState({});
  const [selectedVideo, setSelectedVideo] = useState(null);

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
    <div className="relative min-h-screen bg-slate-50 overflow-hidden">

  {/* ======= BACKGROUND GLOW EFFECT ======= */}
  <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-[120px]"></div>
  <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[120px]"></div>

  <div className="relative max-w-7xl mx-auto px-6 py-20">

    {/* ================= HEADER ================= */}
    <div className="text-center mb-16">
      <div className="inline-flex items-center gap-4 px-8 py-4 bg-white/70 backdrop-blur-xl 
      border border-slate-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500">

        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-500 
        flex items-center justify-center text-white text-xl shadow-md">
          🔍
        </div>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent">
          Explore Sports Content
        </h1>
      </div>

      <p className="mt-6 text-slate-600 text-lg max-w-2xl mx-auto">
        Discover amazing sports stories, analysis, and global highlights.
      </p>
    </div>

    {/* ================= SEARCH + FILTER ================= */}
    <div className="flex justify-center">
  <div className="w-full max-w-5xl bg-white/80 backdrop-blur-2xl 
  border border-slate-200 rounded-3xl shadow-xl p-10">

    {/* SEARCH */}
    <div className="relative max-w-xl mx-auto mb-10 group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-all duration-300" />

      <input
        type="text"
        placeholder="Search sports videos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-300 
        bg-white shadow-sm text-slate-700 placeholder-slate-400
        focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
        transition-all duration-300 hover:shadow-md"
      />
    </div>

    {/* CATEGORY GRID */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

      {[
        { name: "ALL", icon: "📦", count: videoCounts.ALL },
        { name: "UNHEARD STORIES", icon: "📢", count: videoCounts["UNHEARD STORIES"] },
        { name: "MATCH ANALYSIS", icon: "📊", count: videoCounts["MATCH ANALYSIS"] },
        { name: "SPORTS AROUND THE GLOBE", icon: "🌍", count: videoCounts["SPORTS AROUND THE GLOBE"] },
      ].map((cat) => (
        <button
          key={cat.name}
          onClick={() => setSelectedCategory(cat.name)}
          className={`group relative rounded-2xl p-5 text-left transition-all duration-300 
          border shadow-md hover:shadow-xl hover:-translate-y-1
          ${
            selectedCategory === cat.name
              ? "bg-gradient-to-r from-emerald-500 to-indigo-500 text-white border-transparent"
              : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold flex items-center gap-2">
              {cat.icon} {cat.name}
            </span>

            <span className={`text-sm px-3 py-1 rounded-full 
              ${
                selectedCategory === cat.name
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {cat.count || 0}
            </span>
          </div>
        </button>
      ))}
    </div>

  </div>
</div>


    <div className="relative flex flex-col items-center justify-center py-32 text-center overflow-hidden">

  {/* ===== Background Glow ===== */}
  <div className="absolute -top-32 w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-[120px]"></div>
  <div className="absolute -bottom-32 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[120px]"></div>

  {/* ===== Floating Icon Card ===== */}
  <div className="relative mb-10 group">
    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-emerald-500 to-indigo-500 
    flex items-center justify-center shadow-2xl
    transition-all duration-500
    group-hover:scale-110 group-hover:rotate-3">

      <div className="text-white text-5xl">
        🏏
      </div>
    </div>
  </div>

  {/* ===== Title ===== */}
  <h2 className="text-4xl font-bold text-slate-800 mb-5 tracking-tight">
    No Videos Found
  </h2>

  {/* ===== Subtitle ===== */}
  <p className="text-slate-600 text-lg max-w-md mb-12 leading-relaxed">
    Be the first to upload an exciting sports video and inspire the community.
  </p>

  {/* ===== CTA Button ===== */}
  <button
    onClick={() => navigate("/upload")}
    className="relative px-10 py-4 rounded-2xl font-semibold text-white
    bg-gradient-to-r from-emerald-500 to-indigo-500
    shadow-lg transition-all duration-300
    hover:scale-105 hover:-translate-y-1 hover:shadow-2xl"
  >
    🚀 Upload Your First Video
  </button>

</div>


  </div>
</div>

  );
};

export default Explore;
