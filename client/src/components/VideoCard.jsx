import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Play, Calendar, User, Eye, Trash2, Pencil, Share2, Mic2, BarChart3, Globe, PlayCircle } from 'lucide-react';
import { API } from '@/api';
import { getUserId, getToken } from '@/utils/auth';
import { getShareUrl, shareLink } from '@/utils/share';
import { getAssetUrl } from '@/utils/url';
import { motion } from 'framer-motion';

const VideoCard = ({ video, onPlay, onDelete }) => {
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
      case 'UNHEARD STORIES': return <Mic2 className="w-3 h-3" />;
      case 'MATCH ANALYSIS': return <BarChart3 className="w-3 h-3" />;
      case 'SPORTS AROUND THE GLOBE': return <Globe className="w-3 h-3" />;
      default: return <PlayCircle className="w-3 h-3" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.trim()) {
      case 'UNHEARD STORIES': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'MATCH ANALYSIS': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'SPORTS AROUND THE GLOBE': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };


  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative"
    >
      {/* ===== Outer Glow ===== */}
      <div className="absolute -inset-[2px] rounded-[32px] bg-gradient-to-tr from-emerald-500/20 via-indigo-500/20 to-emerald-500/20 blur-md opacity-0 group-hover:opacity-100 transition-all duration-700" />

      <Card className="relative h-full flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[30px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 group-hover:-translate-y-2">

        {/* ===== THUMBNAIL AREA ===== */}
        <div
          className="relative aspect-video overflow-hidden cursor-pointer bg-zinc-100 dark:bg-zinc-800"
          onClick={() => onPlay(video)}
        >
          {/* Subtle Overlay */}
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/40 transition-all duration-500 z-10" />

          {/* Main Play Icon (Center) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
            <div className="w-14 h-14 rounded-full bg-emerald-500/90 text-white flex items-center justify-center transform scale-75 group-hover:scale-100 transition-all shadow-xl">
              <Play className="w-6 h-6 fill-current" />
            </div>
          </div>

          {/* Category Badge (Top Left) */}
          <div className="absolute top-4 left-4 z-20">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border backdrop-blur-md shadow-sm ${getCategoryColor(video.category)}`}>
              {getCategoryIcon(video.category)}
              {video.category || 'SPORTS'}
            </span>
          </div>

          {/* Owner Actions (Top Right) */}
          {videoOwnerId === userId && (
            <div className="absolute top-4 right-4 z-30 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <button
                onClick={(e) => { e.stopPropagation(); handleEdit(); }}
                className="p-2.5 rounded-xl bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 shadow-lg border border-white/50 dark:border-zinc-700/50 transition-all"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                className="p-2.5 rounded-xl bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md text-zinc-600 dark:text-zinc-400 hover:text-red-500 shadow-lg border border-white/50 dark:border-zinc-700/50 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Video Placeholder Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-indigo-500/10 pointer-events-none" />
        </div>

        {/* ===== CONTENT AREA ===== */}
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-1 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors duration-300 tracking-tight">
              {video.title}
            </h3>
            {video.description && (
              <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-5 line-clamp-2 leading-relaxed">
                {video.description}
              </p>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <User className="h-3 w-3 text-emerald-500" />
              </div>
              <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">{video.postedBy?.username || "Athlete"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
              <Calendar className="h-3 w-3" />
              <span className="text-[10px] font-medium">{formatDate(video.createdAt)}</span>
            </div>
          </div>
        </CardContent>

        {/* ===== FOOTER ACTIONS ===== */}
        <CardFooter className="px-6 pb-6 pt-0 flex gap-3">
          <Button
            onClick={() => onPlay(video)}
            className="flex-[2] h-12 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-extrabold text-xs uppercase tracking-wider transition-all duration-300 hover:bg-emerald-500 dark:hover:bg-emerald-400 border-none shadow-lg shadow-zinc-950/20 dark:shadow-emerald-500/10"
          >
            WATCH NOW
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            className="h-12 w-12 rounded-2xl border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all"
            title="Share video"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </CardFooter>

      </Card>
    </motion.div>
  );



};

export default VideoCard;