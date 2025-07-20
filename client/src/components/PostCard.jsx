import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Calendar, Tag, User } from 'lucide-react';
import CommentSection from './CommentSection';
import { API } from '@/api';
import { getToken } from '@/utils/auth';

const PostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);


  const postId = post._id;

  const handleLike = async () => {
    try {
      const res = await API.post(`/posts/${postId}/like`, {}, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      setIsLiked(res.data.likedByUser);
      setLikes(res.data.likesCount);
    } catch (err) {
      console.error('❌ Failed to toggle like:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-green-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-blue-600 cursor-pointer">
              {post.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{post.postedBy?.username || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
              {post.category && (
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                    {post.category}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="mb-4">
          
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
          
        </div>
        
        <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors ${
              isLiked 
                ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likes}</span>
          </Button>
          
         <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)} // toggle comments
          className="flex items-center gap-2 text-gray-600 hover:text-white-600 hover:bg-blue-50"
         >
        <MessageCircle className="h-4 w-4" />
        <span>
            Comments
        </span>
        </Button>

        </div>
        {showComments && (
       <div className="mt-4 border-t pt-4">
       <h4 className="text-sm text-gray-600 mb-2 font-medium">Comments</h4>
       <CommentSection  contentId={post._id} contentType="post"/>
       </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;
