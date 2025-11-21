// Explore.jsx
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white">
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-4">🔍 Explore Sport Content</h1>
          <p className="text-lg text-blue-600 max-w-2xl mx-auto">
            Discover amazing sports stories, analysis, and content from around the world
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6 mb-8">
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent bg-white/70 backdrop-blur-sm"
              />
            </div>
          </div>

          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            videoCounts={videoCounts}
          />
        </div>

        {searchTerm && (
          <div className="text-center mb-6">
            <p className="text-blue-600">
              Found {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''} 
              {searchTerm && ` matching "${searchTerm}"`}
              {selectedCategory !== 'ALL' && ` in ${selectedCategory}`}
            </p>
          </div>
        )}

        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
  <VideoCard
    key={video._id}
    video={{
      ...video, // ✅ Spread the entire original video object
      id: video._id, // Keep override if needed
      videoUrl: `http://localhost:5000${video.videoUrl}` // ✅ still apply full URL
    }}
    onPlay={handleVideoPlay}
    onDelete={(id) => setVideos(prev => prev.filter(v => v._id !== id))}
  />
))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏏</div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">No videos found</h3>
            <p className="text-blue-600 mb-6">
              {videos.length === 0
                ? "Be the first to upload a video!"
                : "Try adjusting your search or filter criteria."}
            </p>
            <button
              onClick={() => window.location.href = '/upload'}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              Upload Your First Video
            </button>
          </div>
        )}
      </div>

      {selectedVideo && (
        <VideoPlayer video={selectedVideo} onClose={handleClosePlayer} onDelete={(id) => setVideos(prev => prev.filter(v => v._id !== id))}/>
      )}
    </div>
  );
};

export default Explore;
