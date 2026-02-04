import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Textarea from '@/components/ui/textarea';

import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, Video, FileVideo } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '../api';

const Upload = () => {
  const fileInputRef = useRef(null);

  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile || !title || !category) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select a video file",
        variant: "destructive"
      });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Please login first");
      navigate('/login');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('video', videoFile);

    try {
      await API.post('/video/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success("Video Uploaded Successfully");
      navigate('/explore');
    } catch (err) {
      toast.error(err.response?.data?.message || '❌ Upload failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12 lg:py-20">
        {/* Enhanced Header */}
        <div className="text-center mb-12 lg:mb-16 group">
          <div className="inline-block p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl mb-6 group-hover:scale-105 transition-all duration-500">
            <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4 leading-tight">
              🎬 Share Your Story
            </h1>
          </div>
          <p className="text-xl lg:text-2xl text-blue-700 font-light max-w-3xl mx-auto leading-relaxed backdrop-blur-sm">
            Upload your videos – unheard stories, match analysis, or sports around the globe
          </p>
        </div>

        {/* Enhanced Form Container */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-green-100/50 p-8 lg:p-12 hover:shadow-3xl transition-all duration-500">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Enhanced Upload Area */}
            <div className="group">
              <label className="block text-green-700 font-bold text-lg mb-6 tracking-wide">
                📹 Upload Video <span className="text-blue-600 text-sm font-normal">*</span>
              </label>
              <div
                className={`group relative border-4 border-dashed rounded-3xl p-12 lg:p-16 text-center transition-all duration-500 cursor-pointer hover:shadow-2xl hover:-translate-y-2 ${isDragging
                    ? 'border-green-400 bg-gradient-to-br from-green-50/90 to-blue-50/90 shadow-2xl ring-4 ring-green-200/50'
                    : videoFile
                      ? 'border-green-400 bg-gradient-to-br from-green-50 to-blue-50 shadow-xl ring-2 ring-green-200/50'
                      : 'border-blue-200 hover:border-green-300 bg-gradient-to-br from-blue-50/50 to-green-50/50 shadow-lg'
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {videoFile ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                      <FileVideo className="h-10 w-10 text-white drop-shadow-md" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-bold text-green-700 truncate max-w-md mx-auto">{videoFile.name}</p>
                      <p className="text-blue-600 font-mono text-sm bg-white/60 px-3 py-1 rounded-full inline-block">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-green-400 rounded-2xl flex items-center justify-center mx-auto shadow-2xl group-hover:rotate-6 transition-all duration-700">
                      <Video className="h-14 w-14 text-white drop-shadow-lg" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-xl font-bold text-blue-700 mb-3 leading-tight">
                        Drag & drop your video here, or{' '}
                        <span className="text-green-600">click to browse</span>
                      </p>
                      <input
                        type="file"
                        accept="video/*"
                        ref={fileInputRef}
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                        className="hidden"
                        id="video-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="border-2 border-green-300 bg-white/80 backdrop-blur-sm text-green-700 font-semibold px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 group-hover:bg-green-50"
                      >
                        <UploadIcon className="mr-3 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                        Choose Video File
                      </Button>
                    </div>
                    <p className="text-blue-500 text-sm font-medium bg-white/70 px-4 py-2 rounded-xl inline-block backdrop-blur-sm">
                      Supports MP4, MOV, AVI • Up to 100MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields - Enhanced */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Title */}
              <div className="space-y-3">
                <label className="block text-green-700 font-bold text-lg tracking-wide">
                  🎤 Video Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 'My First Match Analysis - Epic Comeback!'"
                  className="w-full px-6 py-5 text-lg border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-300/50 focus:border-green-400 shadow-sm hover:shadow-md transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-3">
                <label className="block text-green-700 font-bold text-lg tracking-wide">
                  🏷️ Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full border-2 border-blue-200 rounded-2xl px-6 py-5 text-lg focus:outline-none focus:ring-4 focus:ring-green-300/50 focus:border-green-400 shadow-sm hover:shadow-md transition-all duration-300 bg-white/80 backdrop-blur-sm appearance-none"
                >
                  <option value="" disabled hidden className="text-gray-400">Select video category</option>
                  <option value="UNHEARD STORIES" className="py-4">📢 Unheard Stories</option>
                  <option value="MATCH ANALYSIS" className="py-4">📊 Match Analysis</option>
                  <option value="SPORTS AROUND THE GLOBE" className="py-4">✈️ Sports Around The Globe</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="block text-green-700 font-bold text-lg tracking-wide">
                📝 Description (Optional)
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share the story behind your video, key highlights, or what viewers should know..."
                className="w-full px-6 py-6 text-lg border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-300/50 focus:border-green-400 shadow-sm hover:shadow-md transition-all duration-300 resize-vertical min-h-[140px] bg-white/80 backdrop-blur-sm"
              />
            </div>

            {/* Enhanced Submit Button */}
            <div className="flex justify-center pt-8">
              <Button
                type="submit"
                size="lg"
                className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-16 py-7 text-xl font-black rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 hover:scale-105 transition-all duration-500 border-0 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  🚀 Upload & Share
                  <div className="w-2 h-2 bg-white/30 rounded-full group-hover:animate-ping group-hover:scale-110 transition-all duration-300"></div>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent -skew-x-12 -translate-x-40 group-hover:translate-x-40 transition-transform duration-1000"></div>
              </Button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Upload;
