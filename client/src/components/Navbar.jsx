import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {logout, isLoggedIn} from "../utils/auth"
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Link } from "react-router-dom";
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const navigate = useNavigate();

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, [location]);

  const handlelogout = ()=>{
    logout();
    setLoggedIn(false);
    toast.success("User Logged Out");
    navigate("/login")
  }

  return (
    <nav className="bg-card/95 backdrop-blur-xl shadow-xl sticky top-0 z-50 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - UNCHANGED */}
          <div className="flex items-center">
            <span className="text-2xl font-bold text-green-600">
              🏆 HuddleUp
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink 
              to="/" 
              className={({ isActive }) => `
                font-medium text-muted-foreground hover:text-foreground 
                relative transition-all duration-300 group
                ${isActive ? 'text-foreground font-semibold' : ''}
              `}
              title="Home"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-green-600 group-hover:w-full transition-all duration-300 origin-left"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20 -z-10 blur opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 rounded-full"></span>
            </NavLink>

            <NavLink 
              to="/upload" 
              className={({ isActive }) => `
                font-medium text-muted-foreground hover:text-foreground 
                relative transition-all duration-300 group
                ${isActive ? 'text-foreground font-semibold' : ''}
              `}
              title="Upload"
            >
              Upload
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-green-600 group-hover:w-full transition-all duration-300 origin-left"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20 -z-10 blur opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 rounded-full"></span>
            </NavLink>

            <NavLink 
              to="/explore" 
              className={({ isActive }) => `
                font-medium text-muted-foreground hover:text-foreground 
                relative transition-all duration-300 group
                ${isActive ? 'text-foreground font-semibold' : ''}
              `}
              title="Explore"
            >
              Explore
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-green-600 group-hover:w-full transition-all duration-300 origin-left"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20 -z-10 blur opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 rounded-full"></span>
            </NavLink>

            <NavLink 
              to="/posts" 
              className={({ isActive }) => `
                font-medium text-muted-foreground hover:text-foreground 
                relative transition-all duration-300 group
                ${isActive ? 'text-foreground font-semibold' : ''}
              `}
              title="Discussion"
            >
              Discussion
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-green-600 group-hover:w-full transition-all duration-300 origin-left"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20 -z-10 blur opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 rounded-full"></span>
            </NavLink>
          </div>

          {/* Authentication Section */}
          <div className="flex items-center space-x-3">
            {loggedIn ? (
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={handlelogout}
                  variant="outline"
                  className="bg-card hover:bg-accent/50 hover:backdrop-blur-xl border-border hover:border-accent/50 text-foreground hover:shadow-md transition-all duration-300 font-medium px-6 h-10 rounded-xl"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => navigate("/login")}
                  variant="default"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-medium px-6 h-10 rounded-xl transition-all duration-300 border-0"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => navigate("/register")}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-medium px-6 h-10 rounded-xl transition-all duration-300 border-0"
                >
                  Register
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 rounded-xl hover:bg-accent/50 hover:backdrop-blur-sm transition-all duration-200 text-muted-foreground hover:text-foreground">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
