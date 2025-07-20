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
      <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold text-green-600">
              🏆 HuddleUp
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            

           <Link to="/" className="text-blue-600 hover:text-green-600 font-medium transition-colors">
            Home
           </Link>
            <Link to="/upload" className="text-blue-600 hover:text-green-600 font-medium transition-colors">
            Upload
           </Link>
            <Link to="/explore" className="text-blue-600 hover:text-green-600 font-medium transition-colors">
            Explore
           </Link>
           <Link to="/posts" className= "text-blue-600 hover:text-green-600 font-medium transition-colors">
            Discussion
            </Link>

            
          </div>

          {/* Authentication Section */}
          <div className="flex items-center space-x-4">
            {loggedIn ? (
              <div className="flex items-center space-x-4">
                
                <Button 
                  onClick={handlelogout}
                  variant="outline"
                  className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => navigate("/login")}
                  variant="ghost"
                  className="bg-blue-600 hover:bg-blue-700 text-white" 
                >
                  Login
                </Button>
                <Button 
                  onClick={() => navigate("/register")}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Register
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-blue-600 hover:text-green-600">
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
