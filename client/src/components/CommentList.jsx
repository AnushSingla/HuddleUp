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
    <div className={`relative ${level > 0 ? 'ml-12 border-l-2 border-blue-50 pl-4' : ''}`}>
      <div className="flex items-start space-x-3 py-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {comment.author?.charAt(0).toUpperCase() || '?'}
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-gray-900">{comment.author}</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
              {formatTime(comment.createdAt || comment.timestamp)}
            </span>
          </div>

          <p className="text-sm text-gray-700 mt-1 leading-relaxed">{comment.content}</p>

          {/* Like/Reply Actions */}
          <div className="flex items-center mt-2 space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 p-1 rounded-md transition-colors ${isLiked ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:text-red-500 hover:bg-red-50'}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              {likeCount > 0 && <span className="text-xs font-medium">{likeCount}</span>}
            </button>

            <button
              onClick={() => {
                if (!getToken()) {
                  toast.error("Please login to reply");
                  return;
                }
                setShowReplyForm(!showReplyForm);
              }}
              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-bold uppercase tracking-wide px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
            >
              <Reply className="w-3 h-3" />
              <span>Reply</span>
            </button>
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentInput
                parentId={comment._id}
                contentId={comment.videoId || comment.postId}
                contentType={comment.videoId ? 'video' : 'post'}
                onCommentPosted={(reply) => {
                  onAddComment(reply);
                  setShowReplyForm(false);
                }}
                onCancel={() => setShowReplyForm(false)}
                placeholder="Write a reply..."
                autoFocus
              />
            </div>
          )}

          {/* View Replies Button */}
          {comment.replies?.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center mt-3 text-xs text-blue-500 font-bold hover:text-blue-700 transition-colors"
            >
              <div className="w-6 h-[1px] bg-blue-100 mr-2"></div>
              {showReplies ? 'HIDE' : `VIEW ${comment.replies.length}`} REPL{comment.replies.length !== 1 ? 'IES' : 'Y'}
            </button>
          )}
        </div>

        {/* Options Menu */}
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showOptions && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              <button
                onClick={handleDelete}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
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
      <div className="text-center py-8 text-gray-500">
        <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-lg font-medium text-gray-600">No comments yet</p>
        <p className="text-sm text-gray-500">Be the first to comment</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 border-t border-gray-200 pt-4">
      <div className="text-lg font-medium text-gray-900">Comments</div>
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
