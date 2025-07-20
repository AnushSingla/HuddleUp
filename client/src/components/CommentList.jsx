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
  }, [comment.likes]);

  const handleDelete = async () => {
    try {
      await API.delete(`/comments/${comment.id || comment._id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      onDeleteComment(comment.id || comment._id);
      setShowOptions(false);
      toast.success('Comment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete comment');
      console.error('Delete error:', error);
    }
  };

  const handleLike = async () => {
    try {
      const res = await API.patch(`/comments/${comment.id || comment._id}/like`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      setLikeCount(res.data.likes);
      setIsLiked(res.data.liked);
    } catch (error) {
      toast.error('Failed to update like');
      console.error('Like update failed:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`relative ${level > 0 ? 'ml-14' : ''}`}>
      <div className="flex items-start space-x-3 py-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
            {comment.author.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">{comment.author}</span>
            <span className="text-xs text-gray-500">{formatTime(comment.timestamp)}</span>
          </div>
          
          <p className="text-sm text-gray-800 mt-1">{comment.content}</p>
          
          {/* Like/Reply Actions */}
          <div className="flex items-center mt-2 space-x-4">
            <div className="flex items-center space-x-1">
              <button 
                onClick={handleLike}
                className={`p-1 rounded-full ${isLiked ? 'text-red-600 fill-current' : 'text-gray-500 hover:text-red-600'}`}
              >
                <Heart className="w-5 h-5 text-red-600 fill-current" />
              </button>
              {likeCount > 0 && (
                <span className="text-xs text-gray-600">{likeCount}</span>
              )}
            </div>
            
            <button 
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-sm text-gray-600 hover:text-blue-600 font-medium px-2 py-1 rounded-full hover:bg-blue-50"
            >
              Reply
            </button>
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentInput
                parentId={comment.id || comment._id}
                contentId={comment.videoId || comment.postId}
                contentType={comment.videoId ? 'video' : 'post'}
                onCommentPosted={(reply) => {
               // Append the reply directly into this comment's replies array
               if (!comment.replies) comment.replies = [];
              comment.replies.push(reply);
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
              className="flex items-center mt-2 text-sm text-blue-600 font-medium hover:underline"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              {showReplies ? 'Hide' : 'View'} {comment.replies.length} repl
              {comment.replies.length !== 1 ? 'ies' : 'y'}
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
          {comment.replies?.map((reply) => (
            <CommentItem
              key={reply.id || reply._id}
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
      {comments.map((comment) => (
        <CommentItem
          key={comment.id || comment._id}
          comment={comment}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
        />
      ))}
    </div>
  );
}
