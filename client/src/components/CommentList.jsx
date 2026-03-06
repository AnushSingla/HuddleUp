import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Reply, Trash2, ArrowBigUp, ArrowBigDown, MessageCircle, MoreVertical, Award } from 'lucide-react';
import { API } from '@/api';
import { getToken, getUserId } from '@/utils/auth';
import { toast } from 'sonner';
import CommentInput from './CommentInput';
import EmptyState from '@/components/ui/EmptyState';
import MentionText from './MentionText';

function CommentItem({ comment, onAddComment, onDeleteComment, level = 0, isOP = false }) {
  const navigate = useNavigate();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [voteState, setVoteState] = useState(null); // 'up', 'down', or null
  const [score, setScore] = useState((comment.upvotes || 0) - (comment.downvotes || 0));
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);

  useEffect(() => {
    if (!showOptions) return;
    const handleClickOutside = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) setShowOptions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOptions]);

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

  const handleVote = async (type) => {
    const token = getToken();
    if (!token) {
      toast.error('Please login to vote');
      return;
    }

    // Optimistic update
    const newState = voteState === type ? null : type;
    const scoreDelta =
      voteState === 'up' && type === 'down' ? -2 :
        voteState === 'down' && type === 'up' ? 2 :
          voteState === type ? (type === 'up' ? -1 : 1) :
            type === 'up' ? 1 : -1;

    setVoteState(newState);
    setScore(score + scoreDelta);
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative group`}
      style={{
        marginLeft: level > 0 ? 'var(--surface-thread-indent)' : 0,
        paddingLeft: level > 0 ? 'var(--space-4)' : 0,
        borderLeft: level > 0 ? 'var(--surface-thread-border-left)' : 'none',
        marginTop: 'var(--space-3)',
        paddingTop: 'var(--space-3)',
        borderTop: level === 0 ? 'var(--surface-thread-separator)' : 'none'
      }}
    >
      <div className="flex gap-3">
        {/* VOTE RAIL - Left Side */}
        <div className="flex flex-col items-center gap-1" style={{ width: '32px' }}>
          <button
            onClick={() => handleVote('up')}
            className="transition-all hover:scale-110"
            style={{
              color: voteState === 'up' ? 'var(--turf-green)' : 'var(--text-muted)',
              padding: '2px'
            }}
          >
            <ArrowBigUp className="w-5 h-5" fill={voteState === 'up' ? 'currentColor' : 'none'} />
          </button>
          <span
            className="text-xs font-bold font-mono"
            style={{
              color: score > 0 ? 'var(--turf-green)' : score < 0 ? 'var(--clay-red)' : 'var(--text-sub)'
            }}
          >
            {score > 0 ? '+' : ''}{score}
          </span>
          <button
            onClick={() => handleVote('down')}
            className="transition-all hover:scale-110"
            style={{
              color: voteState === 'down' ? 'var(--clay-red)' : 'var(--text-muted)',
              padding: '2px'
            }}
          >
            <ArrowBigDown className="w-5 h-5" fill={voteState === 'down' ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 min-w-0">
          {/* Author + Time + Badge */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => comment.authorId && navigate(`/user/${comment.authorId}`)}
                className={`flex items-center gap-2 rounded-md transition-opacity ${comment.authorId ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: isOP ? 'var(--accent)' : 'var(--text-muted)',
                    color: 'var(--bg-primary)'
                  }}
                >
                  {comment.author?.charAt(0).toUpperCase() || '?'}
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>
                  {comment.author}
                </span>
              </button>
            </div>

            {isOP && (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded"
                style={{
                  background: 'var(--accent-glow)',
                  color: 'var(--accent)'
                }}
              >
                OP
              </span>
            )}

            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              {formatTime(comment.createdAt || comment.timestamp)}
            </span>
          </div>

          {/* Comment Body */}
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-main)' }}>
            <MentionText text={comment.content} />
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => {
                if (!getToken()) {
                  toast.error("Please login to reply");
                  return;
                }
                setShowReplyForm(!showReplyForm);
              }}
              className="flex items-center gap-1 text-xs font-medium transition-colors"
              style={{
                color: 'var(--text-sub)'
              }}
            >
              <Reply className="w-3 h-3" />
              Reply
            </button>

            {level < 5 && comment.replies?.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs font-medium transition-colors"
                style={{ color: 'var(--accent)' }}
              >
                {showReplies ? 'Hide' : `Show ${comment.replies.length}`} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>

          {/* Reply Form */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-3 overflow-hidden"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Options Menu */}
        <div className="relative" ref={optionsRef}>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-1 rounded transition-opacity opacity-0 group-hover:opacity-100"
            style={{ color: 'var(--text-muted)' }}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showOptions && (
            <div className="absolute right-0 mt-1 w-40 rounded-lg shadow-lg py-1 z-10"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)'
              }}
            >
              <button
                onClick={handleDelete}
                className="block w-full text-left px-4 py-2 text-sm transition-colors"
                style={{
                  color: 'var(--text-main)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--clay-red-muted)';
                  e.target.style.color = 'var(--clay-red)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = 'var(--text-main)';
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      <AnimatePresence>
        {showReplies && comment.replies?.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 overflow-hidden"
          >
            {comment.replies?.map((reply, index) => (
              <CommentItem
                key={reply._id || `reply-${index}`}
                comment={reply}
                onAddComment={onAddComment}
                onDeleteComment={onDeleteComment}
                isOP={isOP}
                level={level + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CommentList({ comments, onAddComment, onDeleteComment, opAuthor }) {

  if (!comments || comments.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="No comments yet"
        description="Be the first to comment."
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h3>
        <span className="text-xs font-mono" style={{ color: 'var(--text-sub)' }}>SORTED: TOP</span>
      </div>

      <div>
        {comments.map((comment, index) => (
          <CommentItem
            key={comment._id || `comment-${index}`}
            comment={comment}
            onAddComment={onAddComment}
            onDeleteComment={onDeleteComment}
            isOP={opAuthor && comment.author === opAuthor}
          />
        ))}
      </div>
    </div>
  );
}
