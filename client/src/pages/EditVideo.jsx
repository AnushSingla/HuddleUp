import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Textarea from '@/components/ui/textarea';
import { toast } from 'sonner';
import { API } from '@/api';
import { getToken } from '@/utils/auth';
import { PlayCircle } from 'lucide-react';
import PageMeta from '@/components/PageMeta';

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
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <PageMeta title="Edit video" description="Edit your video on HuddleUp." />
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-500">
          <PlayCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No video found</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm">We couldn't find the video you're looking to edit. It might have been deleted.</p>
        <button
          onClick={() => navigate('/explore')}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition shadow-lg shadow-emerald-500/20"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-500 py-24 px-6 relative overflow-hidden">
      <PageMeta title={video.title ? `Edit: ${video.title}` : 'Edit video'} description="Edit your video title, description, and category on HuddleUp." />
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Edit <span className="bg-gradient-to-r from-emerald-500 to-indigo-600 bg-clip-text text-transparent">Video</span></h1>
          <p className="text-zinc-500 dark:text-zinc-400">Refine your video details and reach a wider audience.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/70 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 md:p-10 shadow-2xl shadow-indigo-500/5 space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-500 dark:text-zinc-400 ml-1">VIDEO TITLE</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 
              bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-400
              focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50
              transition-all duration-300 shadow-sm"
              placeholder="Give your video a catchy title..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-500 dark:text-zinc-400 ml-1">CATEGORY</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 
              bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50
              transition-all duration-300 shadow-sm appearance-none cursor-pointer"
              required
            >
              <option value="" className="text-zinc-500">Select a category</option>
              <option value="UNHEARD STORIES">Unheard Stories</option>
              <option value="MATCH ANALYSIS">Match Analysis</option>
              <option value="SPORTS AROUND THE GLOBE">Sports Around The Globe</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-500 dark:text-zinc-400 ml-1">DESCRIPTION (OPTIONAL)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us more about this video..."
              className="min-h-[140px] px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 
              bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-400
              focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50
              transition-all duration-300 shadow-sm resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-base transition-all shadow-lg shadow-emerald-500/20"
            >
              {isSubmitting ? 'SAVING CHANGES...' : 'UPDATE VIDEO'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/explore')}
              className="flex-1 h-14 rounded-2xl border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-bold transition-all"
            >
              CANCEL
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVideo;
