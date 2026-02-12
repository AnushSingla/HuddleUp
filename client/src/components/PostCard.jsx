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
      case 'UNHEARD STORIES': return 'bg-green-100 text-green-700 border-green-300';
      case 'MATCH ANALYSIS': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'SPORTS AROUND THE GLOBE': return 'bg-cyan-100 text-cyan-700 border-cyan-300';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  return (
    <Card className="group bg-white border-gray-200 rounded-xl overflow-hidden hover:-translate-y-1 hover:border-green-300 hover:shadow-md transition-all duration-200">
      <CardHeader className="p-5 pb-3 relative">
        <div className="flex items-start gap-4">
          {/* Avatar/Image placeholder */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {post.postedBy?.username?.charAt(0).toUpperCase() || 'A'}
          </div>

          <div className="flex-1 min-w-0 pr-8">
            <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors duration-200">
              {post.title}
            </h3>

            <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span className="text-gray-600">{post.postedBy?.username || 'Anonymous'}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(post.createdAt)}</span>
              </div>

              {post.category && (
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Edit & Delete - only for post owner */}
          {userId === postOwnerId && (

            <div className="absolute top-4 right-4 flex items-center gap-1">
              <button
                onClick={handleEdit}
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all duration-200"
                title="Edit Post"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                title="Delete Post"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

          )}
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0">
        <div className="mb-4">
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center gap-2 rounded-lg transition-all duration-200 ${isLiked
                ? 'text-red-500 hover:text-red-400 hover:bg-red-50'
                : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
              }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-medium">{likes}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="font-medium">Comments</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-200"
            title="Share post"
          >
            <Share2 className="h-4 w-4" />
            <span className="font-medium">Share</span>
          </Button>
        </div>

        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm text-gray-500 mb-3 font-medium">Comments</h4>
            <CommentSection contentId={post._id} contentType="post" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;