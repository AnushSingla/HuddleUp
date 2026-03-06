import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, FileText } from 'lucide-react';
import PageWrapper from '@/components/ui/PageWrapper';
import PageMeta from '@/components/PageMeta';
import EmptyState from '@/components/ui/EmptyState';
import VideoCard from '@/components/VideoCard';
import PostCard from '@/components/PostCard';
import { API } from '@/api';
import { toast } from 'sonner';
import { useSaved } from '@/hooks/useSaved';

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isVideoSaved, isPostSaved, toggleVideo, togglePost, isLoggedIn } = useSaved();

  useEffect(() => {
    const invalid = !userId || userId === 'undefined' || userId === 'null' || userId.trim() === '';
    if (invalid) {
      setLoading(false);
      navigate('/explore', { replace: true });
      return;
    }

    const fetch = async () => {
      setLoading(true);
      try {
        const userRes = await API.get(`/users/${encodeURIComponent(userId)}`);
        const profileUser = userRes.data?.user || null;
        if (!profileUser?._id) {
          setProfile(null);
          setVideos([]);
          setPosts([]);
          setLoading(false);
          return;
        }
        setProfile(profileUser);
        const [videosRes, postsRes] = await Promise.all([
          API.get(`/videos?postedBy=${profileUser._id}`),
          API.get(`/posts?postedBy=${profileUser._id}`),
        ]);
        setVideos(Array.isArray(videosRes.data) ? videosRes.data : []);
        setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
      } catch (err) {
        const status = err.response?.status;
        const data = err.response?.data;
        const isOur404 = status === 404 && data?.message === 'User not found';
        if (status === 404) {
          if (isOur404) {
            toast.info('That profile couldn\'t be found.');
          } else {
            toast.error('Profile unavailable. Deploy the latest server (with user profile route).');
          }
          navigate('/explore', { replace: true });
        } else {
          toast.error('Failed to load profile');
        }
        setProfile(null);
        setVideos([]);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [userId, navigate]);

  const handleVideoPlay = (video) => {
    navigate(`/explore?video=${video._id || video.id}`);
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="mt-4 text-zinc-400">Loading profile...</p>
        </div>
      </PageWrapper>
    );
  }

  if (!profile) {
    return null;
  }

  const displayName = profile.username || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <PageWrapper>
      <PageMeta
        title={`${displayName}'s profile`}
        description={`View ${displayName}'s videos and posts on HuddleUp.`}
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header: Avatar + Name */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl mb-8"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--turf-green), var(--accent))',
              color: 'white',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
            }}
          >
            {initial}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
              {displayName}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Public profile
            </p>
          </div>
        </div>

        {/* Uploads (Videos) */}
        <section className="mb-12">
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>
            <Video className="w-5 h-5" style={{ color: 'var(--turf-green)' }} />
            Uploads
          </h2>
          {videos.length === 0 ? (
            <EmptyState
              icon={Video}
              title="No videos yet"
              description="This user hasn't uploaded any videos."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <VideoCard
                  key={video._id}
                  video={video}
                  onPlay={handleVideoPlay}
                  isSaved={isVideoSaved(video._id)}
                  onSaveToggle={isLoggedIn ? toggleVideo : undefined}
                />
              ))}
            </div>
          )}
        </section>

        {/* Posts */}
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>
            <FileText className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            Posts
          </h2>
          {posts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No posts yet"
              description="This user hasn't created any posts."
            />
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                key={post._id}
                post={post}
                isSaved={isPostSaved(post._id)}
                onSaveToggle={isLoggedIn ? togglePost : undefined}
              />
              ))}
            </div>
          )}
        </section>
      </motion.div>
    </PageWrapper>
  );
}
