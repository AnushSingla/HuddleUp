import React, { useState, useEffect } from 'react';
import { API } from '@/api';
import { toast } from 'sonner';
import { ArrowLeft, Play, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VideoPlayer from '@/components/VideoPlayer';
import { getAssetUrl } from '@/utils/url';

const PlaylistDetail = ({ playlistId, onBack }) => {
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Fetch playlist details
  const fetchPlaylist = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/playlists/${playlistId}`);
      if (response.data.success) {
        console.log('Playlist data:', response.data.playlist); // Debug log
        setPlaylist(response.data.playlist);
      }
    } catch (error) {
      console.error('Error fetching playlist:', error);
      toast.error('Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  // Remove video from playlist
  const removeVideo = async (videoId) => {
    if (!confirm('Remove this video from the playlist?')) return;

    try {
      const response = await API.delete(`/playlists/${playlistId}/videos/${videoId}`);
      if (response.data.success) {
        toast.success('Video removed from playlist');
        // Update the playlist state
        setPlaylist(prev => ({
          ...prev,
          videos: prev.videos.filter(v => (v._id || v.video?._id) !== videoId)
        }));
      }
    } catch (error) {
      console.error('Error removing video:', error);
      toast.error(error.response?.data?.message || 'Failed to remove video');
    }
  };

  useEffect(() => {
    if (playlistId) {
      fetchPlaylist();
    }
  }, [playlistId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'var(--text-sub)' }}>Playlist not found</p>
        <Button onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const VideoThumbnail = ({ video }) => {
    console.log('VideoThumbnail received video:', video); // Debug log
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
    console.log('Video src:', src); // Debug log
    
    return (
      <div className="w-full h-full relative">
        <video
          src={src}
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            console.error('Failed to load video thumbnail from', src);
            // Hide the video element and show fallback
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
          onMouseEnter={(e) => {
            // Show a frame from the video on hover
            e.target.currentTime = 2; // Show frame at 2 seconds
          }}
        />
        {/* Fallback content */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
            background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.3) 0%, rgba(0, 212, 255, 0.2) 100%)',
            display: 'none'
          }}
        >
          <span style={{ color: 'var(--text-sub)' }}>Video Preview</span>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
            {playlist.name}
          </h2>
          {playlist.description && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-sub)' }}>
              {playlist.description}
            </p>
          )}
          <p className="text-sm mt-1" style={{ color: 'var(--text-sub)' }}>
            {playlist.videos?.length || 0} videos • Created {new Date(playlist.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Videos */}
      {playlist.videos?.length === 0 ? (
        <div className="text-center py-12">
          <Play className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-sub)' }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-main)' }}>
            No videos in this playlist
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-sub)' }}>
            Add videos to this playlist from the Explore page
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {playlist.videos.map((videoItem, index) => {
            // Handle both populated and non-populated video references
            const video = videoItem.video || videoItem;
            const videoId = video._id || video.id;
            
            return (
              <div
                key={videoId || index}
                className="relative group cursor-pointer overflow-hidden rounded-lg"
                style={{
                  height: '240px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div className="absolute inset-0">
                  <VideoThumbnail video={video} />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeVideo(videoId);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: 'rgba(0,0,0,0.7)',
                    color: '#ef4444'
                  }}
                  title="Remove from playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Video info */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">
                    {video.title || 'Untitled Video'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <span>#{index + 1}</span>
                    {video.duration && (
                      <>
                        <span>•</span>
                        <span>{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Play button overlay */}
                <div 
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: 'var(--turf-green)',
                      color: 'white'
                    }}>
                    <Play className="w-6 h-6 ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};

export default PlaylistDetail;