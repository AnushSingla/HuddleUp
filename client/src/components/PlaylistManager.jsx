import React, { useState, useEffect } from 'react';
import { API } from '@/api';
import { toast } from 'sonner';
import { Plus, List, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PlaylistDetail from './PlaylistDetail';

const PlaylistManager = () => {
  const [playlists, setPlaylists] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  // Fetch user's playlists
  const fetchPlaylists = async () => {
    try {
      const response = await API.get('/playlists');
      if (response.data.success) {
        setPlaylists(response.data.playlists);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
      if (error.response?.status !== 401) {
        toast.error('Failed to load playlists');
      }
    }
  };

  // Create new playlist
  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylist.name.trim()) {
      toast.error('Playlist name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/playlists', newPlaylist);
      if (response.data.success) {
        toast.success('Playlist created successfully!');
        setPlaylists([response.data.playlist, ...playlists]);
        setNewPlaylist({ name: '', description: '' });
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast.error(error.response?.data?.message || 'Failed to create playlist');
    } finally {
      setLoading(false);
    }
  };

  // Delete playlist
  const deletePlaylist = async (playlistId) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    try {
      const response = await API.delete(`/playlists/${playlistId}`);
      if (response.data.success) {
        toast.success('Playlist deleted successfully');
        setPlaylists(playlists.filter(p => p._id !== playlistId));
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast.error(error.response?.data?.message || 'Failed to delete playlist');
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  // If viewing a specific playlist, show the detail view
  if (selectedPlaylistId) {
    return (
      <PlaylistDetail
        playlistId={selectedPlaylistId}
        onBack={() => setSelectedPlaylistId(null)}
      />
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
          My Playlists
        </h2>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
          style={{
            background: 'var(--turf-green)',
            color: 'white'
          }}
        >
          <Plus className="w-4 h-4" />
          Create Playlist
        </Button>
      </div>

      {/* Create Playlist Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md" style={{ background: 'var(--bg-surface)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>
                Create New Playlist
              </h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-1 hover:bg-gray-100 rounded"
                style={{ color: 'var(--text-sub)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={createPlaylist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-main)' }}>
                  Playlist Name *
                </label>
                <Input
                  type="text"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                  placeholder="Enter playlist name"
                  maxLength={100}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-main)' }}>
                  Description (Optional)
                </label>
                <textarea
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                  placeholder="Enter playlist description"
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg resize-none"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)'
                  }}
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                  style={{
                    background: 'var(--turf-green)',
                    color: 'white'
                  }}
                >
                  {loading ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <div className="text-center py-12">
          <List className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-sub)' }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-main)' }}>
            No playlists yet
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-sub)' }}>
            Create your first playlist to organize your favorite videos
          </p>
          <Button
            onClick={() => setShowCreateForm(true)}
            style={{
              background: 'var(--turf-green)',
              color: 'white'
            }}
          >
            Create Your First Playlist
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist._id}
              className="rounded-lg p-4 border hover:shadow-lg transition-all cursor-pointer hover:border-green-400"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)'
              }}
              onClick={() => setSelectedPlaylistId(playlist._id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-main)' }}>
                    {playlist.name}
                  </h3>
                  {playlist.description && (
                    <p className="text-sm line-clamp-2" style={{ color: 'var(--text-sub)' }}>
                      {playlist.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent playlist click when deleting
                    deletePlaylist(playlist._id);
                  }}
                  className="p-1 hover:bg-red-100 rounded text-red-500 hover:text-red-700"
                  title="Delete playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-sub)' }}>
                <span>{playlist.videos?.length || 0} videos</span>
                <div className="flex items-center gap-2">
                  <span>{new Date(playlist.createdAt).toLocaleDateString()}</span>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ 
                    background: 'var(--turf-green)', 
                    color: 'white',
                    fontSize: '10px'
                  }}>
                    Click to view
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistManager;