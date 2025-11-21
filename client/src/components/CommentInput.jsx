import React, { useState } from 'react';
import { Button } from './ui/button';
import { Send } from 'lucide-react';
import { API } from '@/api';
import { getToken } from '@/utils/auth';

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
    setIsSubmitting(true);
    try {
      const payload = {
        text: comment,
        ...(contentType === 'post' ? { postId: contentId } : { videoId: contentId }),
        parentId: parentId || null,
      };
      const res = await API.post('/comments', payload, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      onCommentPosted(res.data);
      setComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm space-y-2">
      <textarea
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={parentId ? 'Reply to this comment...' : 'Write a comment...'}
        className="w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} className="text-gray-500">
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!comment.trim() || isSubmitting}
          className="flex gap-2 items-center"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              {parentId ? 'Reply' : 'Comment'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
