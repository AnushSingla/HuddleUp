import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import ShareMenu from '@/components/ui/ShareMenu';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Play, Calendar, User, Eye, Trash2, Pencil, Share2, Link2, Clock, Bookmark } from 'lucide-react';
import { API } from '@/api';
import { getUserId, getToken } from '@/utils/auth';
import { getShareUrl, shareLink, copyLinkToClipboard } from '@/utils/share';

const VideoCard = ({ video, onPlay, onDelete, isSaved = false, onSaveToggle }) => {
  const navigate = useNavigate();
  const userId = getUserId();
  const videoOwnerId = video?.postedBy?._id || video?.postedBy;

  const handleEdit = () => {
    navigate('/edit-video', { state: { video } });
  };

  const videoId = video._id || video.id;
  const handleShare = async () => {
    if (!videoId) return;
    const url = getShareUrl('video', videoId);
    await shareLink(
      url,
      video.title || 'Video on HuddleUp',
      video.description?.slice(0, 100) || '',
      (msg) => toast.success(msg),
      (msg) => toast.error(msg)
    );
  };

  const handleCopyLink = (e) => {
    e.stopPropagation();
    if (!videoId) return;
    const url = getShareUrl('video', videoId);
    copyLinkToClipboard(
      url,
      (msg) => toast.success(msg),
      (msg) => toast.error(msg)
    );
  };

  const handleDelete = async () => {
    const id = video._id || video.id;

    if (!id) {
      toast.error("Video ID not found");
      return;
    }
    try {
      await API.delete(`/videos/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      toast.success("Video Deleted");
      if (onDelete) onDelete(id);
    } catch (err) {
      toast.error('Only The Owner can Delete');
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? 'Unknown Date' : date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category) => {
    switch (category?.trim()) {
      case 'UNHEARD STORIES': return '📢';
      case 'MATCH ANALYSIS': return '📊';
      case 'SPORTS AROUND THE GLOBE': return '🌍';
      default: return '🎬';
    }
  };

  const getCategoryStyle = (category) => {
    switch (category?.trim()) {
      case 'UNHEARD STORIES': 
        return { bg: 'rgba(0, 230, 118, 0.15)', color: 'var(--accent-success)', border: 'rgba(0, 230, 118, 0.3)' };
      case 'MATCH ANALYSIS': 
        return { bg: 'rgba(108, 92, 231, 0.15)', color: 'var(--accent)', border: 'rgba(108, 92, 231, 0.3)' };
      case 'SPORTS AROUND THE GLOBE': 
        return { bg: 'rgba(0, 212, 255, 0.15)', color: 'var(--accent-2)', border: 'rgba(0, 212, 255, 0.3)' };
      default: 
        return { bg: 'var(--bg-surface)', color: 'var(--text-sub)', border: 'var(--border-subtle)' };
    }
  };

  const categoryStyle = getCategoryStyle(video.category);

  return (
    <div 
      className="group cursor-pointer hover-lift"
      onClick={() => onPlay(video)}
      style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--r-lg)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        transition: 'all var(--transition-base)'
      }}
    >
      {/* Owner Actions - Only show on hover */}
      {videoOwnerId === userId && (
        <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
            className="p-2 rounded-lg backdrop-blur-md transition-all"
            style={{
              background: 'rgba(17, 24, 39, 0.8)',
              color: 'var(--text-sub)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(108, 92, 231, 0.2)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(17, 24, 39, 0.8)';
              e.currentTarget.style.color = 'var(--text-sub)';
            }}
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="p-2 rounded-lg backdrop-blur-md transition-all"
            style={{
              background: 'rgba(17, 24, 39, 0.8)',
              color: 'var(--text-sub)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 61, 0, 0.2)';
              e.currentTarget.style.color = 'var(--accent-danger)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(17, 24, 39, 0.8)';
              e.currentTarget.style.color = 'var(--text-sub)';
            }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Thumbnail Area - Netflix Style */}
      <div className="relative aspect-video overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        {/* Placeholder gradient if no thumbnail */}
        {!video.thumbnail && (
          <div className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.3) 0%, rgba(0, 212, 255, 0.2) 100%)'
            }}
          />
        )}

        {/* Dark overlay on hover */}
        <div 
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            opacity: 0
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
        />

        {/* Play Button - Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <Play className="w-6 h-6 text-white ml-1" fill="white" />
          </div>
        </div>

        {/* Category Badge - Top Left */}
        <div className="absolute top-3 left-3">
          <span 
            className="px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 backdrop-blur-md"
            style={{
              background: categoryStyle.bg,
              color: categoryStyle.color,
              border: `1px solid ${categoryStyle.border}`
            }}
          >
            <span>{getCategoryIcon(video.category)}</span>
            <span>{video.category}</span>
          </span>
        </div>

        {/* Watch Now overlay - Bottom, appears on hover */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-4 transition-all duration-300"
          style={{
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%)',
            transform: 'translateY(100%)',
            opacity: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(100%)';
            e.currentTarget.style.opacity = '0';
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(video);
            }}
            className="w-full py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2"
            style={{
              background: 'white',
              color: 'var(--bg-primary)',
              fontSize: 'var(--text-sm)'
            }}
          >
            <Play className="w-4 h-4" />
            Watch Now
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title */}
        <h3 
          className="font-bold mb-2 line-clamp-2 group-hover:text-gradient-accent transition-all"
          style={{
            fontSize: 'var(--text-base)',
            lineHeight: 'var(--lh-snug)',
            color: 'var(--text-main)'
          }}
        >
          {video.title}
        </h3>

        {/* Description */}
        {video.description && (
          <p 
            className="mb-3 line-clamp-2"
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-sub)',
              lineHeight: 'var(--lh-normal)'
            }}
          >
            {video.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div
            className="flex items-center gap-2 text-xs cursor-pointer hover:underline"
            style={{ color: 'var(--text-muted)' }}
            onClick={(e) => {
              e.stopPropagation();
              const slug = video.postedBy?.username || videoOwnerId;
              if (slug) navigate(`/user/${encodeURIComponent(slug)}`);
            }}
          >
            <User className="w-3.5 h-3.5" />
            <span>{video.postedBy?.username || "Unknown"}</span>
          </div>

          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(video.createdAt)}</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(video);
            }}
            className="flex-1 py-2 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
            style={{
              background: 'var(--accent)',
              color: 'white',
              transition: 'all var(--transition-base)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
          >
            <Eye className="w-4 h-4" />
            Watch
          </button>
          
          {onSaveToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSaveToggle(videoId);
            }}
            className="p-2 rounded-lg transition-all"
            style={{
              border: '1px solid var(--border-subtle)',
              color: isSaved ? 'var(--accent)' : 'var(--text-sub)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = isSaved ? 'var(--accent)' : 'var(--text-sub)';
            }}
            title={isSaved ? 'Unsave' : 'Save for later'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-lg transition-all"
            style={{
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-sub)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--text-sub)';
            }}
            title="Copy link"
          >
            <Link2 className="w-4 h-4" />
          </button>

          <ShareMenu 
            url={getShareUrl('video', videoId)}
            title={video.title}
            description={video.description}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoCard;