import React, { useEffect, useState } from 'react';
import CommentInput from './CommentInput';
import CommentList from './CommentList';
import { API } from '@/api';
import { MessageCircle, TrendingUp, Users } from 'lucide-react';
import { socket } from '@/lib/socket';

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
        setComments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error loading comments:', err);
        setComments([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (contentId && contentType) fetchComments();
  }, [contentId, contentType]);

  const addComment = (newComment) => {
    setComments((prev) => {
      const existsInTree = (list) => {
        for (const c of list) {
          if (c._id === newComment._id) return true;
          if (c.replies && c.replies.length && existsInTree(c.replies)) return true;
        }
        return false;
      };

      if (existsInTree(prev)) return prev;

      if (newComment.parentId) {
        const addReply = (list) =>
          list.map((comment) =>
            comment._id === newComment.parentId
              ? { ...comment, replies: [...(comment.replies || []), newComment] }
              : { ...comment, replies: comment.replies ? addReply(comment.replies) : [] }
          );
        return addReply(prev);
      }

      return [newComment, ...prev];
    });
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

  useEffect(() => {
    if (!contentId || !contentType) return;

    socket.connect();

    const roomPayload = { contentId, contentType };
    socket.emit('join_content', roomPayload);

    const handleNewComment = (payload) => {
      if (
        payload.contentId !== contentId ||
        payload.contentType !== contentType
      ) {
        return;
      }
      if (payload.comment) {
        addComment(payload.comment);
      }
    };

    const handleDeletedComment = (payload) => {
      const targetId = payload.commentId;
      if (!targetId) return;
      handleDeleteComment(targetId);
    };

    socket.on('comment:new', handleNewComment);
    socket.on('comment:deleted', handleDeletedComment);

    return () => {
      socket.emit('leave_content', roomPayload);
      socket.off('comment:new', handleNewComment);
      socket.off('comment:deleted', handleDeletedComment);
    };
  }, [contentId, contentType]);

  return (
    <div className="space-y-8">
      {/* Discussion Header */}
      <div className="p-6 rounded-xl"
        style={{
          background: 'var(--surface-info-bg)',
          border: 'var(--surface-info-border)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent-glow)' }}
            >
              <MessageCircle className="w-6 h-6" style={{ color: 'var(--accent)' }} />
            </div>
              <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Discussion Thread</h2>
              <p className="text-sm" style={{ color: 'var(--text-sub)' }}>
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'} • Join the debate
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1" style={{ color: 'var(--turf-green)' }}>
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">ACTIVE</span>
            </div>
          </div>
        </div>

        <CommentInput contentId={contentId} contentType={contentType} onCommentPosted={addComment} />
      </div>

      {/* Thread List */}
      <div>
        {isLoading ? (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--text-sub)' }}>Loading comments...</div>
        ) : (
          <CommentList
            comments={comments}
            onAddComment={addComment}
            onDeleteComment={handleDeleteComment}
          />
        )}
      </div>
    </div>
  );
}
