import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import { toast } from 'sonner';
import { Play, Calendar, User, Eye,Trash2 } from 'lucide-react';
import { API } from '@/api';
import {  getUserId,getToken } from '@/utils/auth';

const VideoCard = ({ video, onPlay , onDelete }) => {
  console.log("🔍 Full video object:", video);
  console.log("✅ video.postedBy?._id:", video.postedBy?._id);
  console.log("✅ Logged-in user ID:", getUserId());
  console.log("✅ Should show delete button:", video.postedBy?._id === getUserId());
  const handleDelete = async() =>{
     const id = video._id || video.id; 

  if (!id) {
    toast.error("Video ID not found");
    return;
  }
    try{
      await API.delete(`/videos/${id}`, {
              headers: { Authorization: `Bearer ${getToken()}` },
        })
      toast.success("Video Deleted")
      if (onDelete) onDelete(id);

    }catch(err){
      toast.error('Only The Owner can Delete');
      console.error(err);
    }
  }
  const formatDate = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date) ? 'Unknown Date' : date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};


  const getCategoryIcon = (category) => {
    switch (category) {
      case ' UNHEARD STORIES': return '📢';
      case 'MATCH ANALYSIS': return '📊';
      case 'SPORTS AROUND THE GLOBE': return '🌍';
      default: return '🎬';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case ' UNHEARD STORIES': return 'bg-green-100 text-green-700 border-green-200';
      case 'MATCH ANALYSIS': return 'bg-blue-100 text-blue-700 border-blue-200';
      case ' SPORTS AROUND THE GLOBE': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-blue-100 bg-white/90 backdrop-blur-sm overflow-hidden">
       
        {video.postedBy?._id === getUserId() && (
          
        <button
          onClick={handleDelete}
          className="absolute top-0 right-0 p-1 rounded-full bg-gray-100 text-gray-600 hover:text-red-600 hover:bg-red-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        )}
      {/* Thumbnail */}
      <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 h-48 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <Play className="h-16 w-16 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`${getCategoryColor(video.category)} border font-medium text-xs`}>
            {getCategoryIcon(video.category)} {video.category}
          </Badge>
        </div>

        {/* Preview Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <Button
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
            onClick={() => onPlay(video)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
          {video.title}
        </h3>

       

        {/* Description */}
        {video.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {video.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(video.createdAt)}
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {video.postedBy?.username || 'Unknown User'}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => onPlay(video)}
          className="w-full bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-300 group-hover:shadow-lg"
        >
          <Play className="mr-2 h-4 w-4" />
          Watch Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VideoCard;
