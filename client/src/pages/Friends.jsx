import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
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
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          ...(options.headers || {}),
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    loadData();
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

  const loadUsers = async () => {
    const users = await apiCall("users");
    console.log("All users:", users);
    setAllUsers(users);
  };

  const loadFriends = async () => {
    const friends = await apiCall("friends");
    console.log("Friends data:", friends);
    setFriends(friends);
  };

  const loadFriendRequests = async () => {
    const requests = await apiCall("friends/requests");
    console.log("Friend requests data:", requests);
    setFriendRequests(requests);
  };

  const loadSentRequests = async () => {
    const requests = await apiCall("friends/sent");
    console.log("Sent requests data:", requests);
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
    console.log(`Checking status for user: ${user.username} (${user._id})`);
    console.log("Friends:", friends);
    console.log("Friend requests:", friendRequests);
    console.log("Sent requests:", sentRequests);
    
    const isFriend = friends.some((f) => f._id === user._id);
    console.log(`Is friend: ${isFriend}`);
    
    // Check if we have an incoming friend request from this user
    const hasIncomingRequest = friendRequests.some(r => 
      r.from === user._id || r._id === user._id || r.fromId === user._id || r.senderId === user._id
    );
    console.log(`Has incoming request: ${hasIncomingRequest}`);
    
    // Check if we sent a request to this user - try multiple possible field names
    const hasSentRequest = sentRequests.some((s) => 
      s.to === user._id || s.recipient === user._id || s.recipientId === user._id || 
      s.toId === user._id || s._id === user._id || s.userId === user._id
    );
    console.log(`Has sent request: ${hasSentRequest}`);

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>
            Friends & Community
          </h1>
          <p style={{ color: 'var(--text-sub)' }}>
            Connect with fellow sports enthusiasts
          </p>
        </div>

        <div className="flex space-x-1 mb-6 rounded-lg p-1" style={{ background: 'var(--bg-secondary)' }}>
          {["search", "friends", "requests"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 px-3 py-2 text-sm md:text-base rounded-md transition-all flex items-center justify-center"
              style={{
                background: activeTab === tab ? 'var(--turf-green)' : 'transparent',
                color: activeTab === tab ? 'var(--bg-primary)' : 'var(--text-sub)'
              }}
            >
              {tab === "search" && <Search className="h-4 w-4 mr-1 md:mr-2" />}
              {tab === "friends" && <Users className="h-4 w-4 mr-1 md:mr-2" />}
              {tab === "requests" && <UserPlus className="h-4 w-4 mr-1 md:mr-2" />}
              <span className="hidden sm:inline">
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>
              {tab === "friends" && <span className="ml-1">({friends.length})</span>}
              {tab === "requests" && <span className="ml-1">({friendRequests.length})</span>}
            </button>
          ))}
        </div>

        {activeTab === "search" && (
          <div>
            <div className="mb-6">
              <Input
                placeholder="Search users by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
                style={{
                  background: 'var(--bg-surface)',
                  border: '2px solid var(--border-subtle)',
                  color: 'var(--text-main)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                icon={<Search className="h-4 w-4" />}
              />
            </div>

            <div className="grid gap-3">
              {filteredUsers.map((user) => {
                const status = getUserStatus(user);
                const isLoading = requestLoading[user._id];

                return (
                  <div
                    key={user._id}
                    className="p-3 rounded-lg interactive-card"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{
                          background: 'var(--accent)',
                          color: 'var(--bg-primary)'
                        }}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium truncate" style={{ color: 'var(--text-main)' }}>{user.username}</h3>
                          <p className="text-xs" style={{ color: 'var(--text-sub)' }}>Status: {status}</p>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {status === "none" && (
                          <button
                            onClick={() => sendFriendRequest(user)}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-semibold flex items-center hover-lift disabled:opacity-50"
                            style={{
                              background: 'var(--turf-green)',
                              color: 'var(--bg-primary)',
                              borderRadius: 'var(--r-sm)'
                            }}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <UserPlus className="h-4 w-4 mr-2" />
                            )}
                            Add Friend
                          </button>
                        )}
                        
                        {status === 'pending' && (
                          <button className="px-4 py-2 text-sm font-semibold flex items-center" disabled style={{
                            background: 'transparent',
                            color: 'var(--text-sub)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--r-sm)',
                            opacity: '0.7'
                          }}>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Request Sent
                          </button>
                        )}
                        
                        {status === 'friend' && (
                          <button className="px-4 py-2 text-sm font-semibold flex items-center" disabled style={{
                            background: 'transparent',
                            color: 'var(--text-sub)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--r-sm)',
                            opacity: '0.7'
                          }}>
                            <Users className="h-4 w-4 mr-2" />
                            Friends
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
          <div>
            {friends.length === 0 ? (
              <div className="p-8 text-center rounded-lg" style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)'
              }}>
                <Users className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--border-subtle)' }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-sub)' }}>
                  No friends yet
                </h3>
                <p style={{ color: 'var(--text-sub)' }}>
                  Start by searching for users to connect with!
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {friends.map((friend) => (
                  <div
                    key={friend._id}
                    className="p-3 rounded-lg interactive-card"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{
                        background: 'var(--turf-green)',
                        color: 'var(--bg-primary)'
                      }}>
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium" style={{ color: 'var(--text-main)' }}>{friend.username}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <div>
            {friendRequests.length === 0 ? (
              <div className="p-8 text-center rounded-lg" style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)'
              }}>
                <UserPlus className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--border-subtle)' }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-sub)' }}>
                  No friend requests
                </h3>
                <p style={{ color: 'var(--text-sub)' }}>
                  You'll see incoming friend requests here.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {friendRequests.map((request) => {
                  const isLoading = requestLoading[request._id];

                  return (
                    <div
                      key={request._id}
                      className="p-3 rounded-lg interactive-card"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{
                            background: 'var(--accent)',
                            color: 'var(--bg-primary)'
                          }}>
                            {request.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium truncate" style={{ color: 'var(--text-main)' }}>{request.username}</h3>
                            <p className="text-xs truncate" style={{ color: 'var(--text-sub)' }}>
                              Sent a friend request
                            </p>
                          </div>
                        </div>

                        <div className="flex-shrink-0 flex space-x-1">
                          <button
                            onClick={() => acceptFriendRequest(request)}
                            className="h-8 w-8 flex items-center justify-center rounded hover-lift"
                            disabled={isLoading}
                            title="Accept"
                            style={{ background: 'transparent' }}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--turf-green)' }} />
                            ) : (
                              <UserCheck className="h-4 w-4" style={{ color: 'var(--turf-green)' }} />
                            )}
                          </button>
                          <button
                            onClick={() => rejectFriendRequest(request)}
                            className="h-8 w-8 flex items-center justify-center rounded hover-lift"
                            disabled={isLoading}
                            title="Reject"
                            style={{ background: 'transparent' }}
                          >
                            <UserX className="h-4 w-4" style={{ color: 'var(--clay-red)' }} />
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
  );
};

export default Friends;
