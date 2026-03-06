import React, { useState, useEffect } from 'react';
import { API } from '@/api';
import { toast } from 'sonner';
import { Plus, Check, List } from 'lucide-react';

const AddToPlaylist = ({ videoId, onClose }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingTo, setAddingTo] = useState(null);

  // Fetch user's playlists
  const fetchPlaylists = async () => {
    try {
      const response = await API.get('/playlists');
      if (response.data.success) {
        setPlaylists(response.data.playlists);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast.error('Failed to load playlists');
    }
  };

  // Add video to playlist
  const addToPlaylist = async (playlistId) => {
    setAddingTo(playlistId);
    try {
      const response = await API.post(`/playlists/${playlistId}/videos`, { videoId });
      if (response.data.success) {
        toast.success('Video added to playlist!');
        // Update the playlist in the local state
        setPlaylists(playlists.map(p => 
          p._id === playlistId 
            ? { ...p, videos: [...(p.videos || []), videoId] }
            : p
        ));
      }
    } catch (error) {
      console.error('Error adding video to playlist:', error);
      toast.error(error.response?.data?.message || 'Failed to add video to playlist');
    } finally {
      setAddingTo(null);
    }
  };

  // Check if video is already in playlist
  const isVideoInPlaylist = (playlist) => {
    return playlist.videos && playlist.videos.some(v => 
      (typeof v === 'string' ? v : v._id || v.video?._id) === videoId
    );
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  if (playlists.length === 0) {
    return (
      <div className="p-4 text-center">
        <List className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-sub)' }} />
        <p className="text-sm mb-3" style={{ color: 'var(--text-sub)' }}>
          You don't have any playlists yet
        </p>
        <button
          onClick={onClose}
          className="text-sm underline"
          style={{ color: 'var(--turf-green)' }}
        >
          Create a playlist first
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="font-semibold mb-3" style={{ color: 'var(--text-main)' }}>
        Add to Playlist
      </h3>
      
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {playlists.map((playlist) => {
          const isInPlaylist = isVideoInPlaylist(playlist);
          const isAdding = addingTo === playlist._id;
          
          return (
            <button
              key={playlist._id}
              onClick={() => !isInPlaylist && !isAdding && addToPlaylist(playlist._id)}
              disabled={isInPlaylist || isAdding}
              className="w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left"
              style={{
                background: isInPlaylist ? 'var(--bg-primary)' : 'var(--bg-surface)',
                border: `1px solid ${isInPlaylist ? 'var(--turf-green)' : 'var(--border-subtle)'}`,
                opacity: isInPlaylist ? 0.7 : 1,
                cursor: isInPlaylist ? 'default' : 'pointer'
              }}
            >
              <div className="flex-1">
                <div className="font-medium" style={{ color: 'var(--text-main)' }}>
                  {playlist.name}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-sub)' }}>
                  {playlist.videos?.length || 0} videos
                </div>
              </div>
              
              <div className="ml-3">
                {isAdding ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin" />
                ) : isInPlaylist ? (
                  <Check className="w-5 h-5" style={{ color: 'var(--turf-green)' }} />
                ) : (
                  <Plus className="w-5 h-5" style={{ color: 'var(--text-sub)' }} />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AddToPlaylist;