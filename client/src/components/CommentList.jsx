import React, { useState, useEffect } from 'react';
import { Reply, Trash2, Heart, MessageCircle, MoreVertical } from 'lucide-react';
import { API } from '@/api';
import { getToken, getUserId } from '@/utils/auth';
import { toast } from 'sonner';
import CommentInput from './CommentInput';

function CommentItem({ comment, onAddComment, onDeleteComment, level = 0 }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes?.length || 0);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    const userId = getUserId();
    setIsLiked(comment.likes?.includes(userId));
    setLikeCount(comment.likes?.length || 0);
  }, [comment.likes]);

  const handleDelete = async () => {
    const token = getToken();
    if (!token) {
      toast.error('Please login to delete comments');
      return;
    }
    try {
      await API.delete(`/comments/${comment._id}`);
      onDeleteComment(comment._id);
      setShowOptions(false);
      toast.success('Comment deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    }
  };

  const handleLike = async () => {
    const token = getToken();
    if (!token) {
      toast.error('Please login to like comments');
      return;
    }
    try {
      const res = await API.patch(`/comments/${comment._id}/like`);
      setLikeCount(res.data.likes);
      setIsLiked(res.data.liked);
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '...';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '...';

    const now = new Date();
    const diff = Math.floor((now - date) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`relative ${level > 0 ? 'ml-10 border-l border-zinc-200 dark:border-zinc-800/50 pl-6 my-4' : 'mb-6'}`}>
      <div className="group/item relative flex items-start space-x-4 py-4 px-4 rounded-2xl transition-all duration-300 hover:bg-white dark:hover:bg-zinc-900 shadow-none hover:shadow-xl hover:shadow-emerald-500/5 border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800">
        {/* Avatar */}
        <div className="flex-shrink-0 pt-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-emerald-500/10">
            {comment.author?.charAt(0).toUpperCase() || '?'}
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">{comment.author}</span>
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold">
                {formatTime(comment.createdAt || comment.timestamp)}
              </span>
            </div>
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
            {comment.content}
          </p>

          {/* Actions Block */}
          <div className="flex items-center mt-3 gap-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-all duration-300 ${isLiked ? 'text-emerald-500' : 'text-zinc-400 hover:text-emerald-500 group/like'}`}
            >
              <div className={`p-1.5 rounded-lg transition-all ${isLiked ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-100 dark:bg-zinc-800 group-hover/like:bg-emerald-500/10'}`}>
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-white' : ''}`} />
              </div>
              <span className="text-[11px] font-bold">{likeCount > 0 ? likeCount : 'Like'}</span>
            </button>

            <button
              onClick={() => {
                if (!getToken()) {
                  toast.error("Please login to reply");
                  return;
                }
                setShowReplyForm(!showReplyForm);
              }}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-emerald-500 group/reply transition-colors"
            >
              <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover/reply:bg-emerald-500/10 transition-all">
                <Reply className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider">Reply</span>
            </button>
          </div>

          {/* Reply Form Injection */}
          {showReplyForm && (
            <div className="mt-6 p-4 bg-emerald-50/30 dark:bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
              <CommentInput
                parentId={comment._id}
                contentId={comment.videoId || comment.postId}
                contentType={comment.videoId ? 'video' : 'post'}
                onCommentPosted={(reply) => {
                  onAddComment(reply);
                  setShowReplyForm(false);
                }}
                onCancel={() => setShowReplyForm(false)}
                autoFocus
              />
            </div>
          )}

          {/* Nested Replies Toggle */}
          {comment.replies?.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center mt-4 group/toggle"
            >
              <div className="w-6 h-px bg-zinc-200 dark:bg-zinc-800 group-hover:bg-emerald-500 transition-colors" />
              <span className="ml-3 text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 group-hover:text-emerald-500 uppercase tracking-widest transition-all">
                {showReplies ? 'STOW' : 'SHOW'} {comment.replies.length} REACTION{comment.replies.length !== 1 ? 'S' : ''}
              </span>
            </button>
          )}
        </div>

        {/* Floating Options Menu */}
        <div className="relative opacity-0 group-hover/item:opacity-100 transition-opacity">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showOptions && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl py-2 z-20 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                DELETE COMMENT
              </button>
            </div>
          )}
        </div>
      </div>

      {/* REPLIES RENDER RECURSIVE */}
      {showReplies && (
        <div className="mt-2">
          {comment.replies?.map((reply, index) => (
            <CommentItem
              key={reply._id || `reply-${index}`}
              comment={reply}
              onAddComment={onAddComment}
              onDeleteComment={onDeleteComment}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentList({ comments, onAddComment, onDeleteComment }) {

  if (!comments || comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-zinc-50/50 dark:bg-zinc-900/30 rounded-[32px] border border-dashed border-zinc-200 dark:border-zinc-800">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6 text-zinc-300 dark:text-zinc-600">
          <MessageCircle className="w-8 h-8" />
        </div>
        <p className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">Crickets so far...</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-[200px]">Be the first to ignite the debate in this arena!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {comments.map((comment, index) => (
        <CommentItem
          key={comment._id || `comment-${index}`}
          comment={comment}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
        />
      ))}
    </div>
  );
}
