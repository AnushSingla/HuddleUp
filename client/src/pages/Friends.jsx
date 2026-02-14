import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { API } from "../api";

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("search");
  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState({});
  const [sentRequests, setSentRequests] = useState([]);


  const apiCall = async (url, options = {}) => {
    try {
      const response = await API({
        url,
        method: options.method || "GET",
        data: options.body || {},
        signal: options.signal,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          ...(options.headers || {}),
        },
      });
      return response.data;
    } catch (error) {
      // Rethrow aborted errors to be handled by caller
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') throw error;
      throw new Error(error.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    
    const loadData = async () => {
      setLoading(true);
      try {
        // Pass signal to apiCall wrapper
        await Promise.all([
          loadUsers(abortController.signal), 
          loadFriends(abortController.signal), 
          loadFriendRequests(abortController.signal), 
          loadSentRequests(abortController.signal)
        ]);
      } catch (error) {
        // Ignore aborted requests
        if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') return;
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    return () => abortController.abort();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadUsers(), loadFriends(), loadFriendRequests(), loadSentRequests()]);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async (signal) => {
    const users = await apiCall("users", { signal });
    setAllUsers(users);
  };

  const loadFriends = async (signal) => {
    const friends = await apiCall("friends", { signal });
    setFriends(friends);
  };

  const loadFriendRequests = async (signal) => {
    const requests = await apiCall("friends/requests", { signal });
    setFriendRequests(requests);
  };

  const loadSentRequests = async (signal) => {
    const requests = await apiCall("friends/sent", { signal });
    setSentRequests(requests);
  };

  const sendFriendRequest = async (user) => {
    setRequestLoading((prev) => ({ ...prev, [user._id]: true }));
    try {
      await apiCall(`friends/${user._id}`, { method: "POST" });
      toast.success(`Request sent to ${user.username}`);
      await loadData();
    } catch (error) {
      if (error.message === "Friend request already sent") {
        toast.info(`You already sent a request to ${user.username}`);
      } else if (error.message === "You can't send a friend request to yourself") {
        toast.error("You cannot send a request to yourself.");
      } else {
        toast.error(error.message);
      }
    } finally {
      setRequestLoading((prev) => ({ ...prev, [user._id]: false }));
    }
  };

  const acceptFriendRequest = async (request) => {
    setRequestLoading((prev) => ({ ...prev, [request._id]: true }));
    try {
      await apiCall(`friends/accept/${request._id}`, { method: "POST" });
      toast.success(`You are now friends with ${request.username}`);
      await loadData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRequestLoading((prev) => ({ ...prev, [request._id]: false }));
    }
  };

  const rejectFriendRequest = async (request) => {
    setRequestLoading((prev) => ({ ...prev, [request._id]: true }));
    try {
      await apiCall(`friends/reject/${request._id}`, { method: "POST" });
      toast.success(`Rejected request from ${request.username}`);
      await loadData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRequestLoading((prev) => ({ ...prev, [request._id]: false }));
    }
  };

  const getUserStatus = (user) => {
    const isFriend = friends.some((f) => f._id === user._id);
    
    // Check if we have an incoming friend request from this user
    const hasIncomingRequest = friendRequests.some(r => 
      r.from === user._id || r._id === user._id || r.fromId === user._id || r.senderId === user._id
    );
    
    // Check if we sent a request to this user - try multiple possible field names
    const hasSentRequest = sentRequests.some((s) => 
      s.to === user._id || s.recipient === user._id || s.recipientId === user._id || 
      s.toId === user._id || s._id === user._id || s.userId === user._id
    );

    if (isFriend) return "friend";
    if (hasIncomingRequest) return "incoming";
    if (hasSentRequest) return "pending";
    return "none";
  };

  const filteredUsers = allUsers.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

   return (
    <div className="min-h-screen bg-[#050B14] text-white font-sans overflow-hidden relative selection:bg-[#6EE7B7]/30">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Main dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] to-[#020617]" />

        {/* Geometric Pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `linear-gradient(#2DD4BF 1px, transparent 1px), linear-gradient(to right, #2DD4BF 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
          maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, black 40%, transparent 100%)'
        }} />

        {/* Glows */}
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-[#6EE7B7]/10 rounded-full blur-[120px]" />
      </div>

      {/* CONTAINER */}
      <div className="max-w-4xl mx-auto p-4 relative z-10 pt-10">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-1 tracking-tight">
            Friends & Community
          </h1>
          <p className="text-slate-400 text-md">
            Connect with fellow sports enthusiasts
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center items-center gap-3 mb-6">
          {["search", "friends", "requests"].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  relative px-4 py-2 md:px-6 md:py-2 rounded-full text-sm font-medium transition-all duration-300
                  ${isActive
                    ? "text-[#6EE7B7] border border-[#6EE7B7]/80 shadow-[0_0_15px_rgba(110,231,183,0.3)] bg-[#0F172A]/80 backdrop-blur-sm"
                    : "text-slate-400 bg-[#1E293B]/50 border border-transparent hover:bg-[#1E293B]"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <span className="capitalize">
                    {tab === "friends" ? `Friends (${friends.length})` :
                      tab === "requests" ? `Requests (${friendRequests.length})` :
                        "Search"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === "search" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white" />
                  <input
                    type="text"
                    placeholder="Find your next teammate..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1E293B]/80 border border-slate-600/50 text-white placeholder:text-slate-400 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-[#6EE7B7]/50 focus:ring-1 focus:ring-[#6EE7B7]/50 transition-all shadow-lg"
                  />

                </div>
              </div>

              <div className="grid gap-4">
                {filteredUsers.map((user) => {
                  const status = getUserStatus(user);
                  const isLoading = requestLoading[user._id];

                  return (
                    <div
                      key={user._id}
                      className="relative bg-transparent rounded-[2.5rem] p-1 shadow-[0_0_15px_rgba(255,255,255,0.15)] group w-full"
                    >
                    
                      <div className="absolute inset-0 rounded-[2.5rem] border-2 border-white/80 shadow-[0_0_20px_rgba(255,255,255,0.2)] pointer-events-none" />

                      <div className="relative bg-[#0F172A]/40 backdrop-blur-md rounded-[2.4rem] p-5 flex flex-col md:flex-row items-center justify-between gap-4 h-auto md:h-28 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-5 min-w-0 w-full md:w-auto">
                        
                          <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-[#6EE7B7]/40 ring-2 ring-black/50">
                            <AvatarFallback className="bg-gradient-to-br from-[#6EE7B7] to-[#3B82F6] text-white font-bold text-2xl md:text-3xl">
                              {user.username?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex flex-col justify-center">
                            <h3 className="font-bold text-lg text-white tracking-wider uppercase mb-1">
                              {user.username}
                            </h3>
                            <p className="text-sm font-medium">
                              <span className="text-[#6EE7B7]">Status: </span>
                              <span className="text-[#94A3B8]">{status}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-end">
                          {status === "none" && (
                            <button
                              onClick={() => sendFriendRequest(user)}
                              disabled={isLoading}
                              
                              className=" bg-[#6EE7B7] text-green-950 w-full md:w-auto justify-center hover:bg-[#34D399] font-extrabold rounded-full px-8 py-3 md:py-6 shadow-[0_0_15px_rgba(110,231,183,0.4)] hover:shadow-[0_0_25px_rgba(110,231,183,0.6)] transition-all uppercase tracking-wide text-sm flex items-center gap-2 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin text-black" />
                              ) : (
                                <UserPlus className="h-5 w-5 stroke-[2.5px] text-green-950" />
                              )}
                              ADD FRIEND
                            </button>
                          )}

                          {status === "pending" && (
                            <button disabled className="w-full md:w-auto justify-center bg-transparent border border-[#6EE7B7] text-[#6EE7B7] rounded-full px-8 py-3 md:py-6 uppercase text-sm font-bold tracking-wide flex items-center gap-2 cursor-not-allowed opacity-70">
                              <UserCheck className="h-5 w-5" />
                              REQUEST SENT
                            </button>
                          )}

                          {status === "friend" && (
                            <button disabled
                              className=" bg-[#6EE7B7] text-green-950 w-full md:w-auto justify-center hover:bg-[#34D399] font-extrabold rounded-full px-8 py-3 md:py-6 shadow-[0_0_15px_rgba(110,231,183,0.4)] hover:shadow-[0_0_25px_rgba(110,231,183,0.6)] transition-all uppercase tracking-wide text-sm flex items-center gap-2 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Users className="h-5 w-5" />
                              FRIENDS
                            </button>
                          )}

                          {status === "incoming" && (
                <button
                  onClick={() => setActiveTab("requests")}
                              className=" bg-[#6EE7B7] text-green-950 w-full md:w-auto justify-center hover:bg-[#34D399] font-extrabold rounded-full px-8 py-3 md:py-6 shadow-[0_0_15px_rgba(110,231,183,0.4)] hover:shadow-[0_0_25px_rgba(110,231,183,0.6)] transition-all uppercase tracking-wide text-sm flex items-center gap-2 border border-white/10"
                >
                  <UserCheck className="h-5 w-5" />
                  VIEW REQUEST
                </button>
              )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "friends" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {friends.length === 0 ? (
                <div className="text-center py-20">
                  <Users className="h-16 w-16 text-slate-700 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-400 mb-2">No friends yet</h3>
                  <p className="text-slate-600">Start building your roster!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {friends.map((friend) => (
                    <div
                      key={friend._id}
                      className="relative bg-transparent rounded-[2.5rem] p-1 shadow-[0_0_15px_rgba(255,255,255,0.15)] w-full"
                    >
                      <div className="absolute inset-0 rounded-[2.5rem] border-2 border-white/80 shadow-[0_0_20px_rgba(255,255,255,0.2)] pointer-events-none" />
                      <div className="relative bg-[#0F172A]/40 backdrop-blur-md rounded-[2.4rem] p-5 flex flex-col md:flex-row items-center gap-3 md:gap-5 h-auto md:h-28 text-center md:text-left">
                        <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-[#6EE7B7]/40 ring-2 ring-black/50">
                          <AvatarFallback className="bg-slate-800 text-white font-bold text-2xl md:text-3xl">
                            {friend.username?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-lg text-white uppercase mb-1">{friend.username}</h3>
                          <div className="flex items-center justify-center md:justify-start gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#6EE7B7] shadow-[0_0_5px_#6EE7B7] animate-pulse" />
                            <span className="text-sm text-slate-300">Connected</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {friendRequests.length === 0 ? (
                <div className="text-center py-20">
                  <UserPlus className="h-16 w-16 text-slate-700 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-400 mb-2">No requests</h3>
                </div>
              ) : (
                <div className="grid gap-4">
                  {friendRequests.map((request) => {
                    const isLoading = requestLoading[request._id];
                    return (
                      <div
                        key={request._id}
                        className="relative bg-transparent rounded-[2.5rem] p-1 shadow-[0_0_15px_rgba(255,255,255,0.15)] w-full"
                      >
                        <div className="absolute inset-0 rounded-[2.5rem] border-2 border-white/80 shadow-[0_0_20px_rgba(255,255,255,0.2)] pointer-events-none" />
                        <div className="relative bg-[#0F172A]/40 backdrop-blur-md rounded-[2.4rem] p-5 flex flex-col md:flex-row items-center justify-between gap-4 h-auto md:h-28 text-center md:text-left">
                          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-5 min-w-0 w-full md:w-auto">
                            <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-[#6EE7B7]/40 ring-2 ring-black/50">
                              <AvatarFallback className="bg-slate-800 text-white font-bold text-2xl md:text-3xl">
                                {request.username?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <h3 className="font-bold text-lg text-white uppercase truncate mb-1">{request.username}</h3>
                              <p className="text-sm text-slate-300">Wants to join</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => acceptFriendRequest(request)}
                              disabled={isLoading}
                              className={`h-12 w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center transition-all
                         ${isLoading
                                  ? "cursor-not-allowed opacity-50"
                                  : "hover:bg-[#8afcd4]/50 cursor-pointer"}
                             `}
                            >
                              <UserCheck className="h-6 w-6 md:h-7 md:w-7 stroke-[3px]" />
                            </button>

                            <button
                              onClick={() => rejectFriendRequest(request)}
                              disabled={isLoading}
                              className={`h-12 w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center transition-all
                         ${isLoading
                                  ? "cursor-not-allowed opacity-50"
                                  : "text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"}
                            `}
                            >
                              <UserX className="h-6 w-6 md:h-7 md:w-7" />
                            </button>

                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;
