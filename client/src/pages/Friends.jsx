import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Loader2,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { API } from "../api";
import PageMeta from "@/components/PageMeta";
import { useNotifications } from "@/context/NotificationContext";
import { getUserId } from "@/utils/auth";

const Friends = () => {
  const {
    friendRequests,
    sentRequests,
    friends,
    loading: socialLoading,
    acceptRequest,
    declineRequest,
    sendRequest,
    loadSocialData
  } = useNotifications();

  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("search");
  const [isSearching, setIsSearching] = useState(false);
  const currentUserId = getUserId();

  useEffect(() => {
    loadSocialData();
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    setIsSearching(true);
    try {
      const res = await API.get("/users");
      setAllUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const getUserStatus = (user) => {
    const uid = user._id?.toString();
    if (!uid) return "none";

    if (friends.some((f) => f._id?.toString() === uid)) return "friend";
    if (friendRequests.some((r) => r._id?.toString() === uid || r.from?._id?.toString() === uid)) return "incoming";
    if (sentRequests.some((s) => s._id?.toString() === uid || s.to?._id?.toString() === uid)) return "pending";
    return "none";
  };

  const filteredUsers = allUsers.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
    user._id?.toString() !== currentUserId?.toString()
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-500 overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}>
      <PageMeta title="Friends" description="Find and connect with friends on HuddleUp. Send requests and manage your network." />
      {/* Background Glows */}
      <div className="absolute -top-40 -left-20 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 pt-32 pb-20">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold mb-6"
          >
            <Users className="w-4 h-4" />
            Social Arena
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tight mb-6 uppercase italic"
          >
            Connect with <span className="bg-gradient-to-r from-emerald-500 to-indigo-600 bg-clip-text text-transparent">Champions</span>
          </motion.h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto font-medium" style={{ color: 'var(--text-sub)' }}>
            Build your team, follow top creators, and ignite the sports conversation.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          {[
            { id: "search", label: "Find Users", icon: <Search className="w-4 h-4" /> },
            { id: "friends", label: "My Squad", icon: <Users className="w-4 h-4" />, count: friends.length },
            { id: "requests", label: "Requests", icon: <UserPlus className="w-4 h-4" />, count: friendRequests.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 font-black text-xs uppercase tracking-widest border ${activeTab === tab.id
                ? "bg-emerald-500 border-emerald-400 text-white shadow-xl shadow-emerald-500/20 scale-105"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-emerald-500/50"
                }`}
              style={activeTab === tab.id ? { background: 'var(--turf-green)', color: 'var(--bg-primary)' } : { color: 'var(--text-sub)' }}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? "bg-white text-emerald-600" : "bg-emerald-500 text-white"
                  }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Bar (Only shown in search tab) */}
        {activeTab === "search" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto mb-12"
          >
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="text"
                placeholder="Search usernames..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 
                bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-500
                focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50
                transition-all duration-300 font-bold"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', borderColor: 'var(--border-subtle)' }}
              />
            </div>
          </motion.div>
        )}

        <div className="min-h-[400px]">
          {socialLoading || isSearching ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Scanning the arena...</p>
            </div>
          ) : (
            <motion.div
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {activeTab === "search" && filteredUsers.map((user) => (
                <UserItem
                  key={user._id}
                  user={user}
                  status={getUserStatus(user)}
                  onAction={sendRequest}
                />
              ))}

              {activeTab === "friends" && friends.map((friend) => (
                <UserItem
                  key={friend._id}
                  user={friend}
                  status="friend"
                />
              ))}

              {activeTab === "requests" && friendRequests.map((request) => (
                <UserItem
                  key={request._id}
                  user={request.from || request}
                  status="incoming"
                  onAccept={() => acceptRequest(request._id)}
                  onDecline={() => declineRequest(request._id)}
                />
              ))}

              {/* Empty States */}
              {activeTab === "friends" && friends.length === 0 && (
                <EmptyState
                  icon={<Users className="w-12 h-12" />}
                  title="Squad is Empty"
                  description="Build your network by searching for fellow enthusiasts."
                  actionLabel="Go Find Users"
                  onAction={() => setActiveTab("search")}
                />
              )}

              {activeTab === "requests" && friendRequests.length === 0 && (
                <EmptyState
                  icon={<UserPlus className="w-12 h-12" />}
                  title="Quiet Arena"
                  description="No pending requests at the moment. Your connections are up to date."
                />
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

const UserItem = ({ user, status, onAction, onAccept, onDecline }) => {
  if (!user || !user.username) return null;

  return (
    <motion.div
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
      }}
      className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[24px] p-5 hover:shadow-2xl hover:shadow-emerald-500/5 hover:border-emerald-500/20 transition-all duration-300"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-emerald-500/10"
            style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-white dark:border-zinc-900" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-black text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
            {user.username}
            {status === "friend" && <Sparkles className="w-3 h-3 text-emerald-500" />}
          </h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-0.5" style={{ color: 'var(--text-sub)' }}>
            {status === "friend" ? "Teammate" : "Global User"}
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        {status === "none" && (
          <Button
            onClick={() => onAction(user._id)}
            className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-emerald-500 dark:hover:bg-emerald-500 hover:text-white font-black text-xs h-10 rounded-xl transition-all"
            style={{ background: 'var(--turf-green)', color: 'var(--bg-primary)' }}
          >
            Add Friend
          </Button>
        )}
        {status === "pending" && (
          <div className="w-full flex items-center justify-center gap-2 px-4 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-sub)', border: '1px solid var(--border-subtle)' }}>
            Requested
          </div>
        )}
        {status === "incoming" && (
          <>
            <Button
              onClick={onAccept}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs h-10 rounded-xl shadow-lg shadow-emerald-500/20"
              style={{ background: 'var(--turf-green)', color: 'var(--bg-primary)' }}
            >
              Accept
            </Button>
            <Button
              onClick={onDecline}
              variant="outline"
              className="px-3 border-zinc-200 dark:border-zinc-800 hover:bg-red-50 hover:text-red-500 hover:border-red-100 rounded-xl transition-all"
              style={{ color: 'var(--clay-red)', borderColor: 'var(--border-subtle)' }}
            >
              <UserX className="w-4 h-4" />
            </Button>
          </>
        )}
        {status === "friend" && (
          <div className="w-full flex items-center justify-center gap-2 px-4 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20"
            style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
            <UserCheck className="w-3.5 h-3.5" />
            Connected
          </div>
        )}
      </div>
    </motion.div>
  );
};

const EmptyState = ({ icon, title, description, actionLabel, onAction }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
    <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-6 text-zinc-400 dark:text-zinc-600 border border-zinc-200 dark:border-zinc-800"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
      {icon}
    </div>
    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 italic uppercase tracking-tighter mb-2" style={{ color: 'var(--text-main)' }}>{title}</h3>
    <p className="text-zinc-500 dark:text-zinc-500 text-sm max-w-[280px] font-bold leading-relaxed mb-8" style={{ color: 'var(--text-sub)' }}>
      {description}
    </p>
    {actionLabel && (
      <Button
        onClick={onAction}
        className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs h-11 px-8 rounded-xl shadow-xl shadow-emerald-500/20 transition-all uppercase tracking-widest"
        style={{ background: 'var(--turf-green)', color: 'var(--bg-primary)' }}
      >
        {actionLabel}
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    )}
  </div>
);

export default Friends;
