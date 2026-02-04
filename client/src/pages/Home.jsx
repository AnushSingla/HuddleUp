import React from 'react'
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-white flex flex-col items-center justify-center relative overflow-hidden pt-20 pb-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 text-blue-200 text-8xl">🏏</div>
        <div className="absolute top-32 right-20 text-green-200 text-6xl">⚾</div>
        <div className="absolute bottom-20 left-20 text-blue-300 text-7xl">🏆</div>
        <div className="absolute bottom-32 right-10 text-green-300 text-5xl">🎯</div>
      </div>

      {/* Main Content */}
      <div className="text-center z-10 max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-green-600 mb-8 leading-tight">
          🏆 HuddleUp
        </h1>
        <p className="text-2xl md:text-3xl text-blue-600 mb-6 font-light">
          The Ultimate Sports Community Platform
        </p>
        <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Connect with fellow sports enthusiasts, share your best moments, explore amazing content, and be part of the world's most passionate sports community.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button onClick={() => navigate('/friends')}
            size="lg"
            className="bg-green-500 text-white font-bold px-12 py-5 rounded-full hover:bg-green-600 shadow-xl hover:scale-105 transition-all text-xl"
          >
            Get Started
          </Button>
          <Button  onClick={() => navigate('/explore')}
            size="lg"
            variant="outline"
            className="border-blue-400 text-blue-600 font-bold px-12 py-5 rounded-full hover:bg-blue-50 shadow-xl hover:scale-105 transition-all text-xl"
          >
            Explore Now
          </Button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-6 opacity-90">
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-6 opacity-90">
        {/* Upload */}
        <div onClick={() => navigate('/upload')}
          className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-xl p-6 text-green-600 text-center border border-green-100
            transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:bg-white hover:-translate-y-2"
        >
          <div className="text-3xl mb-3 group-hover:animate-bounce transition-all">📤</div>
          <div className="text-base font-bold group-hover:text-green-700">Upload</div>
        </div>

        {/* Explore */}
        <div
          onClick={() => navigate('/explore')}
          className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-xl p-6 text-blue-600 text-center border border-blue-100
            transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:bg-white hover:-translate-y-2"
        >
          <div className="text-3xl mb-3 group-hover:animate-pulse transition-all">🔍</div>
          <div className="text-base font-bold group-hover:text-blue-700">Explore</div>
        </div>

        {/* Post */}
        <div
          onClick={() => navigate('/posts')}
          className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-xl p-6 text-green-600 text-center border border-green-100
            transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:bg-white hover:-translate-y-2"
        >
          <div className="text-3xl mb-3 group-hover:animate-bounce transition-all">👥</div>
          <div className="text-base font-bold group-hover:text-green-700">Post</div>
        </div>

      </div>

    </div>
  )
}
