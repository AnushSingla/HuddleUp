import React from 'react'
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 text-blue-200 text-8xl">🏏</div>
        <div className="absolute top-32 right-20 text-green-200 text-6xl">⚾</div>
        <div className="absolute bottom-20 left-20 text-blue-300 text-7xl">🏆</div>
        <div className="absolute bottom-32 right-10 text-green-300 text-5xl">🎯</div>
      </div>

      {/* Main Content */}
      <div className="text-center z-10 max-w-4xl mx-auto px-4">
        <h1 className="text-6xl md:text-7xl font-extrabold text-green-600 mb-6 leading-tight">
          🏆 HuddleUp
        </h1>
        <p className="text-2xl md:text-3xl text-blue-600 mb-4 font-light">
          The Ultimate Sports Community Platform
        </p>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Connect with fellow sports enthusiasts, share your best moments, explore amazing content, and be part of the world's most passionate sports community.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button onClick={() => navigate('/friends')}
            size="lg"
            className="bg-green-500 text-white font-bold px-8 py-4 rounded-full hover:bg-green-600 shadow-xl transition-all transform hover:scale-105 text-lg"
          >
            Get Started
          </Button>
          <Button  onClick={() => navigate('/explore')}
            size="lg"
            variant="outline"
            className="border-blue-400 text-blue-600 font-bold px-8 py-4 rounded-full hover:bg-blue-50 shadow-xl transition-all transform hover:scale-105 text-lg"
          >
            Explore Now
          </Button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-6 opacity-80">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-green-600 text-center border border-green-100">
          <div className="text-2xl mb-2">📤</div>
          <div className="text-sm font-medium cursor-pointer hover:text-green-600 transition-colors" onClick={() => navigate('/upload')}>Upload</div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-blue-600 text-center border border-blue-100">
          <div className="text-2xl mb-2">🔍</div>
          <div className="text-sm font-medium cursor-pointer hover:text-green-600 transition-colors" onClick={() => navigate('/explore')}>Explore</div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-green-600 text-center border border-green-100">
          <div className="text-2xl mb-2">👥</div>
          <div className="text-sm font-medium cursor-pointer hover:text-green-600 transition-colors"onClick={() => navigate('/posts')}>Post</div>
        </div>
      </div>
    </div>
  )
}
