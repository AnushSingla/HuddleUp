import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/ui/PageWrapper';
import PageMeta from '@/components/PageMeta';
import EmptyState from '@/components/ui/EmptyState';
import VideoCard from '@/components/VideoCard';
import PostCard from '@/components/PostCard';
import VideoPlayer from '@/components/VideoPlayer';
import { Bookmark, Video, MessageSquare } from 'lucide-react';
import { API } from '@/api';
import { getToken } from '@/utils/auth';
import { useSaved } from '@/hooks/useSaved';
import { toast } from 'sonner';

export default function Saved() {
  const navigate = useNavigate();
  const { isLoggedIn, toggleVideo, togglePost } = useSaved();
  const [savedVideos, setSavedVideos] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    if (!getToken()) {
      navigate('/login');
      return;
    }
    const fetch = async () => {
      try {
        const res = await API.get('/saved');
        const videos = res.data?.savedVideos || [];
        const posts = res.data?.savedPosts || [];
        setSavedVideos(Array.isArray(videos) ? videos : []);
        setSavedPosts(Array.isArray(posts) ? posts : []);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
          return;
        }
        toast.error('Failed to load saved');
        setSavedVideos([]);
        setSavedPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [navigate]);

  if (!isLoggedIn) return null;

  const removeVideoFromList = (id) => {
    setSavedVideos((prev) => prev.filter((v) => (v._id || v) !== id));
  };
  const removePostFromList = (id) => {
    setSavedPosts((prev) => prev.filter((p) => (p._id || p) !== id));
  };
  const handleUnsaveVideo = async (id) => {
    await toggleVideo(id);
    removeVideoFromList(id);
  };
  const handleUnsavePost = async (id) => {
    await togglePost(id);
    removePostFromList(id);
  };

  const total = savedVideos.length + savedPosts.length;
  const isEmpty = total === 0 && !loading;

  return (
    <PageWrapper>
      <PageMeta title="Saved" description="Your saved videos and posts on HuddleUp." />
      <div className="min-h-screen py-8" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center gap-3"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}
            >
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold" style={{ color: 'var(--text-main)' }}>
                Saved for later
              </h1>
              <p className="text-sm md:text-base mt-1" style={{ color: 'var(--text-sub)' }}>
                {loading ? 'Loading…' : `${total} item${total !== 1 ? 's' : ''} saved`}
              </p>
            </div>
          </motion.div>

          {selectedVideo && (
            <VideoPlayer
              video={selectedVideo}
              onClose={() => setSelectedVideo(null)}
            />
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-xl animate-pulse"
                  style={{ background: 'var(--bg-surface)' }}
                />
              ))}
            </div>
          ) : isEmpty ? (
            <EmptyState
              icon={Bookmark}
              title="Nothing saved yet"
              description="Save videos and posts from Explore or Discussion to see them here."
              actionLabel="Explore videos"
              actionHref="/explore"
            />
          ) : (
            <>
              {savedVideos.length > 0 && (
                <section className="mb-10">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                    <Video className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    Saved videos
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedVideos.map((video) => (
                      <VideoCard
                        key={video._id}
                        video={video}
                        onPlay={setSelectedVideo}
                        onDelete={(id) => setSavedVideos((prev) => prev.filter((v) => (v._id || v) !== id))}
                        isSaved
                        onSaveToggle={handleUnsaveVideo}
                      />
                    ))}
                  </div>
                </section>
              )}
              {savedPosts.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                    <MessageSquare className="w-5 h-5" style={{ color: 'var(--turf-green)' }} />
                    Saved posts
                  </h2>
                  <div className="space-y-4">
                    {savedPosts.map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        onDelete={removePostFromList}
                        isSaved
                        onSaveToggle={handleUnsavePost}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
