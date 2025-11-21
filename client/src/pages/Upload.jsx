import React, { useRef, useState } from 'react';
import  {Button}  from '@/components/ui/button';
import  Textarea  from '@/components/ui/textarea';

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
      alert('Please fill in all required fields and select a video file');
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select a video file",
        variant: "destructive"
      });
      return;
    }

    const token = localStorage.getItem('token');
    console.log("Token from localStorage:", token);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('video', videoFile);

    //

    try {
      const res = await API.post('/video/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success("Video Uploaded Successfully");
      navigate('/explore');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || '❌ Upload failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-white">
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-4">
            🎬 Share Your  Story
          </h1>
          <p className="text-lg text-blue-600 max-w-2xl mx-auto">
            Upload your  videos – unheard stories, match analysis, or sports around the globe
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-green-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload Area */}
            
            
            <div className="mb-6">
              <label className="block text-green-700 font-semibold mb-3">
                Upload Video *
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-green-400 bg-green-50'
                    : videoFile
                    ? 'border-green-300 bg-green-50'
                    : 'border-blue-200 hover:border-green-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {videoFile ? (
                  <div className="space-y-3">
                    <FileVideo className="mx-auto h-12 w-12 text-green-500" />
                    <p className="text-green-700 font-medium">{videoFile.name}</p>
                    <p className="text-blue-600 text-sm">
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Video className="mx-auto h-16 w-16 text-blue-300" />
                    <div>
                      <p className="text-blue-600 font-medium mb-2">
                        Drag and drop your video here, or
                      </p>
                      <input
                        type="file"
                        accept="video/*"
                         ref={fileInputRef}
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                        className="hidden"
                        id="video-upload"
                      />
                      <label htmlFor="video-upload">
                        <Button type="button" variant="outline" className="border-green-300 text-green-600"onClick={() => fileInputRef.current.click()}>
                          <UploadIcon className="mr-2 h-4 w-4" />
                          Choose Video File
                        </Button>
                      </label>
                    </div>
                    <p className="text-blue-500 text-sm">Supports MP4, MOV, AVI files up to 100MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-green-700 font-semibold mb-2">Video Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your video a catchy title..."
                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-green-700 font-semibold mb-2">Category *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} 
                 required 
                 className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-300">
                  <option value="" disabled hidden>Select video category</option>
                  <option value="UNHEARD STORIES"> 📢 Unheard Stories</option>
                  <option value="MATCH ANALYSIS">📊 Match Analysis</option>
                  <option value="SPORTS AROUND THE GLOBE"> ✈️ Sports Around The Globe</option>
                </select>


            </div>

            {/* Description */}
            <div>
              <label className="block text-green-700 font-semibold mb-2">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us more about your video content..."
                className="w-full border-blue-200 focus:ring-green-300 min-h-[120px]"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white px-12 py-4 text-lg font-semibold rounded-full shadow-lg transition-all transform hover:scale-105"
              >
                🚀 Upload & Share
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;
