import React, { useState } from 'react';
import { Button } from './ui/button';
import { Send } from 'lucide-react';
import { API } from '@/api';
import { getToken } from '@/utils/auth';
import { toast } from 'sonner';

export default function CommentInput({
  parentId = null,
  contentId,
  contentType,
  onCommentPosted,
  onCancel,
}) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    if (!getToken()) {
      toast.error(parentId ? "Please login to reply" : "Please login to comment");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        text: comment,
        ...(contentType === 'post' ? { postId: contentId } : { videoId: contentId }),
        ...(parentId && { parentId }),
      };
      const res = await API.post('/comments', payload, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      onCommentPosted(res.data);
      setComment('');
      toast.success(parentId ? "Reply posted" : "Thought published");
    } catch (err) {
      console.error('Error posting comment:', err);
      const errMsg = err.response?.data?.message || err.message || "Failed to post comment";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative group/form">
      <div className="relative">
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={parentId ? 'Write your reply...' : 'Share your thoughts with the community...'}
          className="w-full px-5 py-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm 
          text-zinc-900 dark:text-zinc-100 placeholder-zinc-400
          focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 
          transition-all duration-300 shadow-sm resize-none"
        />

        <div className="flex items-center justify-between mt-4">
          <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
            {comment.length > 0 ? `${comment.length} CHARACTERS` : 'BE RESPECTFUL & CONSTRUCTIVE'}
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                className="h-10 rounded-xl px-4 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 uppercase tracking-wider"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={!comment.trim() || isSubmitting}
              className={`h-10 px-5 rounded-xl flex gap-2 items-center transition-all duration-300 font-bold text-xs uppercase tracking-wider shadow-lg ${isSubmitting ? 'opacity-70' : ''
                } bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20`}
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{parentId ? 'Send Reply' : 'Post Thought'}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
