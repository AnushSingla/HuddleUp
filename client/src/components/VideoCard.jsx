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
    <Card className="group bg-slate-900 border-slate-800 rounded-xl overflow-hidden hover:-translate-y-1 hover:border-slate-700 transition-all duration-200 relative">
      {/* Edit & Delete - only for video owner */}
      {videoOwnerId === userId && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
          <button
            onClick={handleEdit}
            className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 transition-all duration-200"
            title="Edit Video"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-all duration-200"
            title="Delete Video"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <Play className="h-16 w-16 text-white/80 drop-shadow-lg group-hover:scale-110 group-hover:text-white transition-all duration-300" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`${getCategoryColor(video.category)} border text-xs font-medium backdrop-blur-sm`}>
            {getCategoryIcon(video.category)} {video.category?.trim()}
          </Badge>
        </div>

        {/* Preview Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
          <Button
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 rounded-lg"
            onClick={() => onPlay(video)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>

      <CardContent className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors duration-200">
          {video.title}
        </h3>

        {/* Description */}
        {video.description && (
          <p className="text-slate-400 text-sm mb-4 line-clamp-2">
            {video.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(video.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            <span>{video.postedBy?.username || 'Unknown'}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button
          onClick={() => onPlay(video)}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/25"
        >
          <Play className="mr-2 h-4 w-4" />
          Watch Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VideoCard;