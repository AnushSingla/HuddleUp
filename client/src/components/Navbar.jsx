import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, useScroll , useMotionValueEvent } from "framer-motion";
import { Menu, X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationDropdown from "./NotificationDropdown";
import { useNotifications } from "@/context/NotificationContext";
import { useNotificationFeed } from "@/hooks/useNotificationFeed";
import { logout, isLoggedIn } from "../utils/auth";
import { toast } from "sonner";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { scrollY } = useScroll();

  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [open, setOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { friendRequests } = useNotifications();
  const {
    notifications: activityNotifications,
    unreadCount: activityUnreadCount,
    markAsRead,
    markAllAsRead,
    refetch: refetchActivity,
  } = useNotificationFeed({ limit: 15 });

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

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
    { to: "/about", label: "About" },
    { to: "/contributors", label: "Contributors" },
    { to: "/feedback", label: "Feedback" }
  ];

  return (
    <motion.nav
      className={`sticky top-0 z-50 border-b transition-all duration-300
        ${scrolled
          ? "backdrop-blur-xl bg-zinc-950/90 border-white/20"
          : "backdrop-blur-lg bg-zinc-950/70 border-white/10"
        }`}
      style={{
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.3)' : 'none'
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className={`flex items-center justify-between transition-all duration-300
          ${scrolled ? "h-14" : "h-16"}`}>

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
                    ${isActive ? "" : "text-zinc-400 hover:text-white"}`}
                    style={isActive ? {
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    } : {}}
                  >
                    {label}
                    {isActive && (
                      <motion.span
                        layoutId="navHighlight"
                        className="absolute left-0 -bottom-1 h-[2px] w-full bg-gradient-to-r from-emerald-500 to-green-500 rounded"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
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
                  {showNotifications && (
                    <div
                      className="fixed inset-0 z-[99]"
                      aria-hidden
                      onClick={() => setShowNotifications(false)}
                    />
                  )}
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      if (!showNotifications) refetchActivity();
                    }}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-emerald-400 transition-all duration-300 relative group"
                  >
                    <Bell className="w-5 h-5" />
                    {(friendRequests.length > 0 || activityUnreadCount > 0) && (
                      <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-zinc-950 shadow-lg shadow-emerald-500/20">
                        {friendRequests.length + activityUnreadCount}
                      </span>
                    )}

                    <span className="absolute inset-0 rounded-xl bg-emerald-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity animate-pulse" />
                  </button>

                  <NotificationDropdown
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                    activityNotifications={activityNotifications}
                    activityUnreadCount={activityUnreadCount}
                    onMarkAsRead={markAsRead}
                    onMarkAllAsRead={markAllAsRead}
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
        <>
          <div
            className="fixed inset-0 z-40 md:hidden"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div className="md:hidden border-t border-white/10 bg-zinc-950/95 backdrop-blur-xl relative z-50">
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
                <>
                  <Button
                    onClick={() => navigate("/profile")}
                    variant="outline"
                    className="w-full border-blue-400 text-blue-400"
                  >
                    Profile
                  </Button>
                  <Button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    Logout
                  </Button>
                </>
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
        </>
      )}
    </motion.nav>
  );
}
