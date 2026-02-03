import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout, isLoggedIn } from "../utils/auth";
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const navigate = useNavigate();

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, [location]);

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    toast.success("User Logged Out");
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-zinc-950 border-b border-zinc-800">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink to="/" className="text-2xl font-bold text-white hover:opacity-90 transition-opacity">
              🏆 HuddleUp
            </NavLink>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { to: "/", label: "Home" },
              { to: "/upload", label: "Upload" },
              { to: "/explore", label: "Explore" },
              { to: "/posts", label: "Discussion" }
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `
                  relative font-medium text-sm uppercase tracking-wide
                  transition-colors duration-200
                  ${isActive ? 'text-white' : 'text-zinc-400 hover:text-white'}
                `}
              >
                {label}
                <span className={`
                  absolute -bottom-1 left-0 h-0.5 bg-blue-500 transition-all duration-300
                  ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}
                `} />
              </NavLink>
            ))}
          </div>

          {/* Authentication Section */}
          <div className="flex items-center gap-3">
            {loggedIn ? (
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-600 rounded-lg px-5 h-10 text-sm font-medium transition-all duration-200"
              >
                Logout
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => navigate("/login")}
                  variant="ghost"
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg px-5 h-10 text-sm font-medium transition-all duration-200"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/register")}
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-5 h-10 text-sm font-medium transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
                >
                  Register
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-200">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}