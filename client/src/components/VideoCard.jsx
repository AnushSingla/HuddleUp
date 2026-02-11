import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Play, Calendar, User, Eye, Trash2, Pencil } from 'lucide-react';
import { API } from '@/api';
import { getUserId, getToken } from '@/utils/auth';

const VideoCard = ({ video, onPlay, onDelete }) => {
  const navigate = useNavigate();
  const userId = getUserId();
  const videoOwnerId = video?.postedBy?._id || video?.postedBy;

  const handleEdit = () => {
    navigate('/edit-video', { state: { video } });
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

  const getCategoryColor = (category) => {
    switch (category?.trim()) {
      case 'UNHEARD STORIES': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'MATCH ANALYSIS': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'SPORTS AROUND THE GLOBE': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };


    return (
  <div className="group relative rounded-3xl overflow-hidden transition-all duration-500">

    {/* ===== Gradient Border Glow Effect ===== */}
    <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r 
    from-emerald-500/0 via-indigo-500/0 to-emerald-500/0 
    group-hover:from-emerald-500/40 group-hover:via-indigo-500/40 group-hover:to-emerald-500/40 
    blur-md opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

    <Card className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-800 
    rounded-3xl overflow-hidden shadow-lg 
    transition-all duration-500
    group-hover:-translate-y-3 group-hover:shadow-2xl">

      {/* ===== OWNER ACTIONS ===== */}
      {videoOwnerId === userId && (
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button
            onClick={handleEdit}
            className="p-2 rounded-xl bg-slate-800/80 backdrop-blur-md 
            text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/20 
            transition-all duration-300"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            onClick={handleDelete}
            className="p-2 rounded-xl bg-slate-800/80 backdrop-blur-md 
            text-slate-400 hover:text-red-400 hover:bg-red-500/20 
            transition-all duration-300"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ===== THUMBNAIL ===== */}
      <div className="relative h-52 overflow-hidden">

        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950"></div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500"></div>

        {/* Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md 
          flex items-center justify-center 
          transition-all duration-500
          group-hover:scale-110 group-hover:bg-white/20">
            <Play className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 text-xs font-semibold rounded-full 
          bg-white/10 backdrop-blur-md border border-white/20 text-white">
            {getCategoryIcon(video.category)} {video.category}
          </span>
        </div>

        {/* Preview Button */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
          <Button
            size="sm"
            onClick={() => onPlay(video)}
            className="bg-gradient-to-r from-emerald-500 to-indigo-500 
            text-white rounded-xl shadow-md hover:shadow-xl 
            transition-all duration-300"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <CardContent className="p-6">

        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 
        group-hover:text-emerald-400 transition-colors duration-300">
          {video.title}
        </h3>

        {video.description && (
          <p className="text-slate-400 text-sm mb-5 line-clamp-2">
            {video.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(video.createdAt)}
          </div>

          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            {video.postedBy?.username || "Unknown"}
          </div>
        </div>
      </CardContent>

      {/* ===== FOOTER BUTTON ===== */}
      <CardFooter className="px-6 pb-6 pt-0">
        <Button
          onClick={() => onPlay(video)}
          className="w-full rounded-2xl bg-gradient-to-r 
          from-emerald-500 to-indigo-500 
          text-white font-semibold 
          transition-all duration-300
          hover:scale-[1.02] hover:shadow-xl"
        >
          <Play className="mr-2 h-4 w-4" />
          Watch Now
        </Button>
      </CardFooter>

    </Card>
  </div>
);


};

export default VideoCard;