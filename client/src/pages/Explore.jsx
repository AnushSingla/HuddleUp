// Explore.jsx
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import Navbar from '@/components/Navbar';
import VideoCard from '@/components/VideoCard';
import CategoryFilter from '@/components/CategoryFilter';
import VideoPlayer from '@/components/VideoPlayer';
import { API } from '@/api';

const Explore = () => {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [videoCounts, setVideoCounts] = useState({});
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await API.get('/videos');
        const allVideos = res.data;

        setVideos(allVideos);
        setFilteredVideos(allVideos);

        const counts = {
          ALL: allVideos.length,
          'UNHEARD STORIES': allVideos.filter(v => v.category === 'UNHEARD STORIES').length,
          'MATCH ANALYSIS': allVideos.filter(v => v.category === 'MATCH ANALYSIS').length,
          'SPORTS AROUND THE GLOBE': allVideos.filter(v => v.category === 'SPORTS AROUND THE GLOBE').length
        };
        setVideoCounts(counts);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

  useEffect(() => {
    let filtered = [...videos];

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(video => video.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (video.description && video.description.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        {/* Header - Smaller */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl mb-4">
            <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              🔍 Explore Sports Content
            </h1>
          </div>
          <p className="text-lg lg:text-xl text-blue-700 font-light max-w-2xl mx-auto">
            Discover amazing sports stories, analysis, and content from around the world
          </p>
        </div>

        {/* Search & Filter Container - Smaller */}
        <div className="bg-white/90 backdrop-blur-2xl rounded-2xl shadow-xl border border-green-100/50 p-6 lg:p-8 mb-8">
          <div className="space-y-6">
            {/* Search Bar - Smaller */}
            <div className="group">
              <div className="relative max-w-lg mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400 group-hover:text-green-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-base border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300/50 focus:border-green-400 bg-white/80 backdrop-blur-xl shadow-md hover:shadow-lg transition-all"
                />
              </div>
            </div>

            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              videoCounts={videoCounts}
            />
          </div>
        </div>

        {/* Search Results - Smaller */}
        {searchTerm && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg">
              <div className="text-xl">📊</div>
              <p className="text-lg text-blue-700 font-semibold">
                Found {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Video Grid */}
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video._id}
                video={{
                  ...video,
                  id: video._id,
                  videoUrl: `http://localhost:5000${video.videoUrl}`
                }}
                onPlay={handleVideoPlay}
                onDelete={(id) => setVideos(prev => prev.filter(v => v._id !== id))}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-6 mx-auto w-24 h-24 bg-gradient-to-br from-blue-400 to-green-400 rounded-2xl flex items-center justify-center shadow-xl">
              🏏
            </div>
            <h3 className="text-3xl font-bold text-green-600 mb-4">No Videos Found</h3>
            <p className="text-xl text-blue-600 mb-8 max-w-xl mx-auto">
              {videos.length === 0
                ? "Be the first to upload a video!"
                : "Try adjusting your search or filter criteria."}
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-105 transition-all duration-300"
            >
              🚀 Upload Your First Video
            </button>
          </div>
        )}
      </div>

      {selectedVideo && (
        <VideoPlayer 
          video={selectedVideo} 
          onClose={handleClosePlayer} 
          onDelete={(id) => setVideos(prev => prev.filter(v => v._id !== id))}
        />
      )}
    </div>
  );
};

export default Explore;
