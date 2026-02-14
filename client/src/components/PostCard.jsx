import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Calendar, Tag, User, Trash2, Pencil, Share2 } from 'lucide-react';
import CommentSection from './CommentSection';
import { API } from '@/api';
import { getToken, getUserId } from '@/utils/auth';
import { getShareUrl, shareLink } from '@/utils/share';
import { toast } from 'sonner';
import { motion } from "framer-motion";


const PostCard = ({ post, onDelete }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);

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
      case 'UNHEARD STORIES': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
      case 'MATCH ANALYSIS': return 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
      case 'SPORTS AROUND THE GLOBE': return 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20';
      default: return 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700';
    }
  };

  return (
    <Card className="group relative bg-white dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500">
      <CardHeader className="p-6 pb-4 relative">
        <div className="flex items-start gap-4">
          {/* Avatar with Gradient */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg shadow-emerald-500/20">
            {post.postedBy?.username?.charAt(0).toUpperCase() || 'A'}
          </div>

          <div className="flex-1 min-w-0 pr-8">
            <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-3 line-clamp-2 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors duration-300">
              {post.title}
            </h3>

            <div className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex-wrap">
              <div className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/50">
                <User className="h-3 w-3 text-emerald-500" />
                <span className="text-zinc-600 dark:text-zinc-400">{post.postedBy?.username || 'Anonymous'}</span>
              </div>

              <div className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/50">
                <Calendar className="h-3 w-3 text-indigo-500" />
                <span>{formatDate(post.createdAt)}</span>
              </div>

              {post.category && (
                <div className="flex items-center gap-1.5">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Edit & Delete - only for post owner */}
          {userId === postOwnerId && (
            <div className="absolute top-6 right-6 flex items-center gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <button
                onClick={handleEdit}
                className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 rounded-xl transition-all shadow-sm"
                title="Edit Post"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-red-500 rounded-xl transition-all shadow-sm"
                title="Delete Post"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <div className="mb-6">
          <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap line-clamp-5 hover:line-clamp-none transition-all duration-500">
            {post.content}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`h-11 px-6 flex items-center gap-2.5 rounded-2xl transition-all duration-300 border ${isLiked
                ? 'bg-red-50 dark:bg-red-500/10 text-red-500 border-red-100 dark:border-red-500/20'
                : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 border-zinc-100 dark:border-zinc-800/50 hover:bg-red-50 dark:hover:bg-red-500/5 hover:text-red-500 hover:border-red-100'
              }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-bold">{likes}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className={`h-11 px-6 flex items-center gap-2.5 rounded-2xl transition-all duration-300 border ${showComments
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'
                : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 border-zinc-100 dark:border-zinc-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 hover:text-emerald-600 hover:border-emerald-100'
              }`}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="font-bold">DEBATE</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="h-11 w-11 p-0 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500 border border-zinc-100 dark:border-zinc-800/50 hover:bg-emerald-500/5 hover:text-emerald-500 hover:border-emerald-500/20 transition-all duration-300 ml-auto"
            title="Share post"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {showComments && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/50"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
              <h4 className="text-sm font-bold tracking-widest text-zinc-900 dark:text-zinc-100 uppercase">Debate Arena</h4>
            </div>
            <CommentSection contentId={post._id} contentType="post" />
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;