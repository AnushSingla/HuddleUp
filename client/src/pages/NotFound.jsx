import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft, AlertCircle } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 text-zinc-700 text-9xl animate-bounce">🏏</div>
        <div className="absolute top-40 right-20 text-zinc-700 text-7xl animate-pulse">⚽</div>
        <div className="absolute bottom-40 left-32 text-zinc-700 text-8xl animate-bounce">🏀</div>
        <div className="absolute bottom-20 right-40 text-zinc-700 text-6xl animate-pulse">🎾</div>
        <div className="absolute top-1/2 left-1/4 text-zinc-800 text-9xl animate-pulse">⚾</div>
        <div className="absolute top-1/3 right-1/4 text-zinc-800 text-7xl animate-bounce">🏈</div>
      </div>

      {/* Main Content */}
      <div className="text-center z-10 max-w-3xl mx-auto px-6">
        {/* 404 with Icon */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <AlertCircle className="w-16 h-16 text-red-500 animate-pulse" />
          <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500">
            404
          </h1>
          <AlertCircle className="w-16 h-16 text-red-500 animate-pulse" />
        </div>

        {/* Error Message */}
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Oops! Out of Bounds! 🚫
        </h2>
        
        <p className="text-xl md:text-2xl text-zinc-400 mb-4">
          Looks like this play didn't go as planned.
        </p>
        
        <p className="text-lg text-zinc-500 mb-12 max-w-xl mx-auto">
          The page you're looking for has been benched, traded, or doesn't exist in our lineup. 
          Let's get you back in the game!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-8 py-6 rounded-lg hover:shadow-lg hover:shadow-blue-600/30 transition-all duration-300 text-lg flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </Button>
          
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold px-8 py-6 rounded-lg hover:shadow-lg hover:shadow-green-600/30 transition-all duration-300 text-lg flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Home
          </Button>
          
          <Button
            onClick={() => navigate('/explore')}
            variant="outline"
            className="border-2 border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-600 font-bold px-8 py-6 rounded-lg transition-all duration-300 text-lg flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            Explore
          </Button>
        </div>

        {/* Fun Sports Quote */}
        <div className="mt-16 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl backdrop-blur-sm">
          <p className="text-zinc-400 italic text-lg">
            "You miss 100% of the shots you don't take... <br />
            but you also miss pages that don't exist." 
          </p>
          <p className="text-zinc-600 text-sm mt-2">— HuddleUp Team 🏆</p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      </div>
    </div>
  );
}
