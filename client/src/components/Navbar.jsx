import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { logout, isLoggedIn } from "../utils/auth";
import { toast } from "sonner";
import { Menu, X, Bell } from "lucide-react";
import {motion , AnimatePresence} from "framer-motion";
import axios from "axios";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setOpen(false);
  }, [location]);

  useEffect(() => {
    if (!loggedIn) return;

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/notifications`
,
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

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-4">

            {loggedIn && (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
                >
                  <Bell className="text-white" />

                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-red-500 text-xs text-white px-2 rounded-full shadow-lg"
                    >
                      {notifications.filter(n => !n.isRead).length}
                    </motion.span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="absolute right-0 mt-4 w-80 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 space-y-3 max-h-96 overflow-y-auto"
                    >
                      {notifications.length === 0 ? (
                        <p className="text-sm text-zinc-400">
                          No notifications
                        </p>
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
            )}

            {loggedIn ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleLogout}
                  className="px-6 py-2 font-semibold rounded-xl 
                  bg-gradient-to-r from-pink-500 to-red-500 
                  shadow-lg shadow-pink-500/30"
                >
                  LOGOUT
                </Button>
              </motion.div>
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
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10"
          >
            <div className="px-6 py-6 space-y-5">
              {links.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className="block text-zinc-300 hover:text-white text-lg transition"
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
