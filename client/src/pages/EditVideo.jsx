import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Textarea from '@/components/ui/textarea';
import { toast } from 'sonner';
import { API } from '@/api';
import { getToken } from '@/utils/auth';

const EditVideo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const video = location.state?.video;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (video) {
      setTitle(video.title ?? '');
      setDescription(video.description ?? '');
      setCategory(video.category ?? '');
    }
  }, [video]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!video?._id) {
      toast.error('Video not found');
      navigate('/explore');
      return;
    }
    if (!title.trim() || !category.trim()) {
      toast.error('Title and category are required');
      return;
    }
    if (!getToken()) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      await API.put(`/videos/${video._id}`, {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
      });
      toast.success('Video updated successfully');
      navigate('/explore');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update video');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <p className="text-gray-600">No video to edit. <button type="button" onClick={() => navigate('/explore')} className="text-blue-600 underline">Go to Explore</button></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Video</h1>
        <p className="text-gray-600 mb-8">Update title, description, and category.</p>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400"
              placeholder="Video title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
              required
            >
              <option value="" className="text-gray-500">Select category</option>
              <option value="UNHEARD STORIES" className="text-gray-900">Unheard Stories</option>
              <option value="MATCH ANALYSIS" className="text-gray-900">Match Analysis</option>
              <option value="SPORTS AROUND THE GLOBE" className="text-gray-900">Sports Around The Globe</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="min-h-[120px] resize-none bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300"
            />
          </div>
          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting} className="bg-green-500 hover:bg-green-600 text-white">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/explore')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVideo;
