import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationDropdown from "./NotificationDropdown";
import { useNotifications } from "@/context/NotificationContext";
import { logout, isLoggedIn } from "../utils/auth";
import { toast } from "sonner";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [open, setOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { friendRequests } = useNotifications();

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    toast.success("User Logged Out");
    navigate("/login");
  };

  const links = [
    { to: "/", label: "Home" },
    { to: "/upload", label: "Upload" },
    { to: "/explore", label: "Explore" },
    { to: "/posts", label: "Discussion" },
    { to: "/contact", label: "Contact" },
    { to: "/about", label: "About" }
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/70 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-16 flex items-center justify-between">

          {/* Logo */}
          <NavLink
            to="/"
            className="text-xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"
          >
            HuddleUp
          </NavLink>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map(({ to, label }) => (
              <NavLink key={to} to={to}>
                {({ isActive }) => (
                  <span
                    className={`relative text-sm font-medium transition-colors
                    ${isActive ? "text-white" : "text-zinc-400 hover:text-white"}`}
                  >
                    {label}
                    <span
                      className={`absolute left-0 -bottom-1 h-[2px] bg-gradient-to-r from-blue-500 to-purple-500 transition-all
                      ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
                    />
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Auth Buttons & Notifications (Desktop) */}
          <div className="hidden md:flex items-center gap-6">
            {loggedIn ? (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-emerald-400 transition-all duration-300 relative group"
                  >
                    <Bell className="w-5 h-5" />
                    {friendRequests.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-zinc-950 shadow-lg shadow-emerald-500/20">
                        {friendRequests.length}
                      </span>
                    )}

                    <span className="absolute inset-0 rounded-xl bg-emerald-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity animate-pulse" />
                  </button>

                  <NotificationDropdown
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                  />
                </div>

                <Button
                  onClick={handleLogout}
                  className="rounded-xl px-5 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 font-bold uppercase tracking-wider text-xs"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  className="text-zinc-400 hover:text-white font-bold uppercase tracking-wider text-xs"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/register")}
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-600/30 font-bold uppercase tracking-wider text-xs h-10 px-6"
                >
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-zinc-950/95 backdrop-blur-xl">
          <div className="px-6 py-4 space-y-4">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className="block text-zinc-300 hover:text-white transition"
              >
                {label}
              </NavLink>
            ))}

            <div className="pt-4 border-t border-white/10 flex gap-3">
              {loggedIn ? (
                <Button
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Logout
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/login")}
                    className="w-full border-zinc-700"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => navigate("/register")}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600"
                  >
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
