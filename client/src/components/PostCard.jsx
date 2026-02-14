import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Calendar, Tag, User, Trash2, Pencil, Share2, ArrowBigUp, ArrowBigDown, Pin, MoreHorizontal } from 'lucide-react';
import CommentSection from './CommentSection';
import { API } from '@/api';
import { getToken, getUserId } from '@/utils/auth';
import { getShareUrl, shareLink } from '@/utils/share';
import { toast } from 'sonner';

const PostCard = ({ post, onDelete, isPinned = false }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [voteState, setVoteState] = useState(null); // 'up', 'down', or null

  const postId = post._id;
  const userId = getUserId();
  const postOwnerId = post.postedBy?._id || post.postedBy;

  const handleEdit = () => {
    navigate('/create-post', { state: { editPost: post } });
  };

  const handleShare = async () => {
    const url = getShareUrl('post', postId);
    await shareLink(
      url,
      post.title || 'Post on HuddleUp',
      post.content?.slice(0, 100) || '',
      (msg) => toast.success(msg),
      (msg) => toast.error(msg)
    );
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await API.delete(`/posts/${postId}`);
      toast.success("Post deleted successfully");
      if (onDelete) onDelete(postId);
    } catch (err) {
      console.error('❌ Failed to delete post:', err);
      toast.error(err.response?.data?.message || "Failed to delete post.");
    }
  };

  const handleLike = async () => {
    const token = getToken();
    if (!token) {
      toast.error("Please login first to like posts");
      return;
    }

    try {
      const res = await API.post(`/posts/${postId}/like`);
      setIsLiked(res.data?.likedByUser);
      setLikes(res.data?.likesCount || 0);
    } catch (err) {
      console.error('❌ Failed to toggle like:', err);
      if (err.response?.status === 401) {
        toast.error("Please login first to like posts");
      } else {
        toast.error(err.response?.data?.message || "Failed to like post.");
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getCategoryColor = (category) => {
    switch (category?.toUpperCase()) {
      case 'UNHEARD STORIES': return { bg: 'rgba(0, 230, 118, 0.15)', color: 'var(--accent-success)' };
      case 'MATCH ANALYSIS': return { bg: 'rgba(108, 92, 231, 0.15)', color: 'var(--accent)' };
      case 'SPORTS AROUND THE GLOBE': return { bg: 'rgba(0, 212, 255, 0.15)', color: 'var(--accent-2)' };
      default: return { bg: 'var(--bg-surface)', color: 'var(--text-sub)' };
    }
  };

  const categoryStyle = post.category ? getCategoryColor(post.category) : null;

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="group relative interactive-card transition group-hover:opacity-50 hover:!opacity-100"
      style={{
        background: isPinned ? 'var(--bg-elevated)' : 'var(--bg-surface)',
        borderRadius: 'var(--r-md)',
        overflow: 'hidden',
        borderLeft: isPinned ? '3px solid var(--accent)' : '3px solid transparent'
      }}
    >
      {/* Reddit-style Vote Rail */}
      <div className="flex gap-0">
        {/* Left Vote Column */}
        <div className="flex flex-col items-center gap-1 px-3 py-4" style={{ 
          background: 'var(--bg-primary)',
          borderRight: '1px solid var(--border-subtle)',
          minWidth: '60px'
        }}>
          <button
            onClick={() => setVoteState(voteState === 'up' ? null : 'up')}
            className="p-1 rounded hover:bg-white/10 transition-all"
            style={{ color: voteState === 'up' ? 'var(--accent-success)' : 'var(--text-muted)' }}
          >
            <ArrowBigUp className={`w-6 h-6 ${voteState === 'up' ? 'fill-current' : ''}`} />
          </button>
          
          <span className="text-sm font-bold py-1" style={{ 
            color: voteState === 'up' ? 'var(--accent-success)' : voteState === 'down' ? 'var(--accent-danger)' : 'var(--text-main)'
          }}>
            {likes}
          </span>
          
          <button
            onClick={() => setVoteState(voteState === 'down' ? null : 'down')}
            className="p-1 rounded hover:bg-white/10 transition-all"
            style={{ color: voteState === 'down' ? 'var(--accent-danger)' : 'var(--text-muted)' }}
          >
            <ArrowBigDown className={`w-6 h-6 ${voteState === 'down' ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4">
          {/* Sticky Post Badge */}
          {isPinned && (
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold" style={{ color: 'var(--accent)' }}>
              <Pin className="w-4 h-4" />
              PINNED POST
            </div>
          )}

          {/* Header Row - Author + Meta */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Author Avatar */}
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: 'var(--accent)',
                  color: 'white'
                }}
              >
                {post.postedBy?.username?.charAt(0).toUpperCase() || 'A'}
              </div>

              {/* Author Name */}
              <span className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>
                {post.postedBy?.username || 'Anonymous'}
              </span>

              {/* Time */}
              <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <Calendar className="w-3 h-3" />
                {formatDate(post.createdAt)}
              </span>

              {/* Category Badge */}
              {post.category && categoryStyle && (
                <span 
                  className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                  style={{
                    background: categoryStyle.bg,
                    color: categoryStyle.color
                  }}
                >
                  <Tag className="w-3 h-3" />
                  {post.category}
                </span>
              )}
            </div>

            {/* Actions Menu */}
            {userId === postOwnerId && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleEdit}
                  className="p-2 rounded-lg hover:bg-white/5 transition-all"
                  style={{ color: 'var(--text-muted)' }}
                  title="Edit Post"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg hover:bg-red-500/10 transition-all"
                  style={{ color: 'var(--accent-danger)' }}
                  title="Delete Post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Post Title - Large & Bold (Reddit Style) */}
          <h3 
            className="font-bold mb-3 line-clamp-2 hover:underline cursor-pointer"
            style={{
              fontSize: 'var(--text-xl)',
              lineHeight: 'var(--lh-snug)',
              color: 'var(--text-main)'
            }}
          >
            {post.title}
          </h3>

          {/* Post Content */}
          <div className="mb-4">
            <p 
              className="leading-relaxed whitespace-pre-wrap line-clamp-4"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-sub)'
              }}
            >
              {post.content}
            </p>
          </div>

          {/* Thread Actions Bar */}
          <div className="flex items-center gap-1 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={handleLike}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium"
              style={{
                color: isLiked ? 'var(--accent-danger)' : 'var(--text-sub)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likes} Likes</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium"
              style={{
                color: showComments ? 'var(--accent)' : 'var(--text-sub)',
                background: showComments ? 'rgba(108, 92, 231, 0.1)' : 'transparent'
              }}
              onMouseEnter={(e) => !showComments && (e.currentTarget.style.background = 'var(--bg-elevated)')}
              onMouseLeave={(e) => !showComments && (e.currentTarget.style.background = 'transparent')}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Comments</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium"
              style={{ color: 'var(--text-sub)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              title="Share post"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          {/* Thread Depth Visual Line + Comments Section */}
          {showComments && (
            <div className="mt-4 relative">
              {/* Visual thread line */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-0.5"
                style={{ background: 'var(--accent)', opacity: 0.3 }}
              />
              <div className="pl-6 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <h4 className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>
                  Discussion Thread
                </h4>
                <CommentSection contentId={post._id} contentType="post" />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;