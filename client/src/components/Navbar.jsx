import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, useScroll , useMotionValueEvent } from "framer-motion";
import { Menu, X, Bell, Moon, Sun, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout, isLoggedIn } from "../utils/auth";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import axios from "axios";
import { useTheme } from "@/context/theme-context.jsx";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const { theme, toggleTheme } = useTheme();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setOpen(false);
    setShowProfileMenu(false);
    
    if (isLoggedIn()) {
      fetchUsername();
    }
  }, [location]);

  const fetchUsername = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsername(res.data.user?.username || "User");
    } catch (err) {
      console.error("Failed to fetch username:", err);
    }
  };

  useEffect(() => {
    if (!loggedIn) return;

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/notifications",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();
  }, [loggedIn]);

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setShowProfileMenu(false);
    toast.success("User Logged Out");
    navigate("/login");
  };

  const links = [
    { to: "/", label: "Home" },
    { to: "/live-match", label: "Live Match Room" },
    { to: "/upload", label: "Upload" },
    { to: "/explore", label: "Explore" },
    { to: "/posts", label: "Discussion" },
    { to: "/contact", label: "Contact" },
    { to: "/about", label: "About" },
    { to: "/feedback", label: "Feedback" }
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 backdrop-blur-2xl bg-black/70 border-b border-white/10 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-16 flex items-center justify-between">

          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="text-2xl font-extrabold cursor-pointer bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
          >
            HuddleUp
          </motion.div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 relative">
            {links.map(({ to, label }) => (
              <NavLink key={to} to={to}>
                {({ isActive }) => (
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="relative px-1 cursor-pointer"
                  >
                    <span
                      className={`text-sm font-semibold tracking-wide transition-all duration-300
                      ${
                        isActive
                          ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {label}
                    </span>

                    {/* Sliding Active Underline */}
                    {isActive && (
                      <motion.div
                        layoutId="activeLink"
                        className="absolute left-0 -bottom-1 h-[2px] w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full"
                      />
                    )}
                  </motion.div>
                )}
              </NavLink>
            ))}
          </div>

          {/* Auth Buttons, Theme Toggle & Notifications (Desktop) */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-emerald-400 transition-all duration-300 relative group"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
              <span className="absolute inset-0 rounded-xl bg-emerald-500/10 opacity-0 group-hover:opacity-100 blur-lg transition-opacity" />
            </button>

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
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-emerald-400 transition-all duration-300 relative group"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.filter(n => !n.isRead).length > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-zinc-950 shadow-lg shadow-emerald-500/20">
                        {notifications.filter(n => !n.isRead).length}
                      </span>
                    )}
                    <span className="absolute inset-0 rounded-xl bg-emerald-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity animate-pulse" />
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3 }}
                        className="absolute right-0 mt-4 w-80 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 space-y-3 max-h-96 overflow-y-auto z-50"
                      >
                        {notifications.length === 0 ? (
                          <p className="text-sm text-zinc-400">No notifications</p>
                        ) : (
                          notifications.map((n) => (
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              key={n._id}
                              className={`p-3 rounded-xl text-sm transition cursor-pointer ${
                                n.isRead
                                  ? "bg-zinc-800"
                                  : "bg-gradient-to-r from-indigo-600/30 to-purple-600/30"
                              }`}
                            >
                              <strong className="text-white">
                                {n.sender?.username}
                              </strong>{" "}
                              <span className="text-zinc-300">{n.type}</span>
                            </motion.div>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Avatar Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-300 hover:shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #6c5ce7 100%)',
                      boxShadow: showProfileMenu ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none'
                    }}
                    title={username}
                  >
                    {username.charAt(0).toUpperCase()}
                  </button>

                  {/* Profile Dropdown Menu */}
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-3 w-56 rounded-2xl shadow-2xl overflow-hidden z-50"
                      style={{
                        background: 'rgba(24, 24, 27, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
                      }}
                    >
                      {/* Header Section */}
                      <div className="p-4" style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(108, 92, 231, 0.1) 100%)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {username}
                            </p>
                            <p className="text-xs text-zinc-400">
                              Logged in
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setShowProfileMenu(false);
                          }}
                          className="w-full px-4 py-3 text-sm font-medium flex items-center gap-3 transition-all hover:bg-white/5 text-white"
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
                            <User className="w-4 h-4" style={{ color: '#10b981' }} />
                          </div>
                          <span>View Profile</span>
                        </button>
                      </div>

                      {/* Divider */}
                      <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />

                      {/* Logout Section */}
                      <div className="p-2">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-3 text-sm font-medium flex items-center gap-3 transition-all rounded-lg hover:bg-red-500/10 text-red-400"
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
                            <LogOut className="w-4 h-4" />
                          </div>
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  className="text-zinc-400 hover:text-white"
                >
                  Login
                </Button>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => navigate("/register")}
                    className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 shadow-lg"
                  >
                    Register
                  </Button>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-zinc-400 hover:text-white transition"
          >
            {open ? <X /> : <Menu />}
          </motion.button>
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
                <>
                  <Button
                    onClick={() => {
                      navigate("/profile");
                      setOpen(false);
                    }}
                    variant="outline"
                    className="w-full border-blue-400 text-blue-400 hover:bg-blue-500/10"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                  <Button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
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
      )}
    </motion.nav>
  );
}
