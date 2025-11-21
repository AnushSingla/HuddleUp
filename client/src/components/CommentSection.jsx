import React, { useEffect, useState } from 'react';
import CommentInput from './CommentInput';
import CommentList from './CommentList';
import { API } from '@/api';
import { MessageCircle, TrendingUp, Users } from 'lucide-react';

export default function CommentSection({ contentId, contentType }) {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const endpoint =
          contentType === 'post'
            ? `/comments/post/${contentId}`
            : `/comments/${contentId}`;
        const res = await API.get(endpoint);
        setComments(res.data);
      } catch (err) {
        console.error('Error loading comments:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (contentId && contentType) fetchComments();
  }, [contentId, contentType]);

  const addComment = (newComment) => {
    if (newComment.parentId) {
      const addReply = (list) =>
        list.map((comment) =>
          comment._id === newComment.parentId
            ? { ...comment, replies: [...(comment.replies || []), newComment] }
            : { ...comment, replies: comment.replies ? addReply(comment.replies) : [] }
        );
      setComments((prev) => addReply(prev));
    } else {
      setComments((prev) => [newComment, ...prev]);
    }
  };

  const handleDeleteComment = (commentId) => {
    const removeComment = (list) =>
      list
        .filter((c) => c._id !== commentId)
        .map((c) => ({
          ...c,
          replies: c.replies ? removeComment(c.replies) : [],
        }));
    setComments((prev) => removeComment(prev));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-full p-3">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Discussion</h2>
              <p className="text-gray-600 text-sm">
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'} • Join the conversation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>Active</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{Math.max(1, Math.floor(comments.length * 1.5))} participants</span>
            </div>
          </div>
        </div>

        <CommentInput contentId={contentId} contentType={contentType} onCommentPosted={addComment} />
      </div>

      {isLoading ? (
        <div className="text-center text-sm text-gray-500">Loading comments...</div>
      ) : (
        <CommentList
          comments={comments}
          onAddComment={addComment}
          onDeleteComment={handleDeleteComment}
        />
      )}
    </div>
  );
}
