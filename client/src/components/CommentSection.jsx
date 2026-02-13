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
    <div className="space-y-8">
      {/* Header Container */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[28px] p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <MessageCircle className="w-7 h-7 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">Debate Arena</h2>
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <span>{comments.length} Thoughts</span>
                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span className="text-emerald-500">Global Stream</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-800" />
              ))}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span>{Math.max(1, Math.floor(comments.length * 1.2))} PARTICIPANTS</span>
            </div>
          </div>
        </div>

        <CommentInput contentId={contentId} contentType={contentType} onCommentPosted={addComment} />
      </div>

      {/* Comments List */}
      <div className="relative">
        <div className="absolute left-7 top-0 bottom-0 w-px bg-zinc-100 dark:bg-zinc-800/50 -z-10" />
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Warming up the arena...</p>
          </div>
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
