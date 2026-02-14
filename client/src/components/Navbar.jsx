import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { Menu, X,Bell} from "lucide-react";
=======
>>>>>>> main
import { Button } from "@/components/ui/button";
import { logout, isLoggedIn } from "../utils/auth";
import { toast } from "sonner";

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
        "http://localhost:5000/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

          {/* Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {loggedIn && (
  <div className="relative">
    <button
      onClick={() => setShowNotifications(!showNotifications)}
      className="relative p-2 rounded-lg hover:bg-white/10"
    >
      <Bell className="text-white" />

      {notifications.filter(n => !n.isRead).length > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-xs text-white px-2 rounded-full">
          {notifications.filter(n => !n.isRead).length}
        </span>
      )}
    </button>

    {showNotifications && (
      <div className="absolute right-0 mt-3 w-80 bg-zinc-900 border border-white/10 rounded-xl shadow-xl p-4 space-y-3 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-sm text-zinc-400">No notifications</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-3 rounded-lg text-sm cursor-pointer ${
                n.isRead ? "bg-zinc-800" : "bg-zinc-700"
              }`}
            >
              <p>
                <strong>{n.sender?.username}</strong> {n.type}
              </p>
            </div>
          ))
        )}
      </div>
    )}
  </div>
)}

            {loggedIn ? (
              <Button
                onClick={handleLogout}
                className="rounded-xl px-5 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20"
              >
                Logout
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  className="text-zinc-400 hover:text-white"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/register")}
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-600/30"
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
