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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Friends & Community
          </h1>
          <p className="text-gray-600">
            Connect with fellow sports enthusiasts
          </p>
        </div>

        <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
          {["search", "friends", "requests"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 text-sm md:text-base rounded-md transition-colors flex items-center justify-center ${
                activeTab === tab
                  ? "bg-green-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
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
                icon={<Search className="h-4 w-4" />}
              />
            </div>

            <div className="grid gap-3">
              {filteredUsers.map((user) => {
                const status = getUserStatus(user);
                const isLoading = requestLoading[user._id];

                return (
                  <Card
                    key={user._id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center space-x-3 min-w-0">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-gray-200 text-gray-700">
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <h3 className="font-medium truncate">{user.username}</h3>
                            <p className="text-xs text-gray-400">Status: {status}</p>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          {status === "none" && (
                            <Button
                            onClick={() => sendFriendRequest(user)}
                            size="sm"
                            disabled={isLoading}
                            className="bg-green-500 hover:bg-green-600 text-white border-0"
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <UserPlus className="h-4 w-4 mr-2" />
                            )}
                            Add Friend
                          </Button>
                        )}
                        
                        {status === 'pending' && (
                          <Button size="sm" variant="outline" disabled>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Request Sent
                          </Button>
                        )}
                        
                        {status === 'friend' && (
                          <Button size="sm" variant="outline" disabled>
                            <Users className="h-4 w-4 mr-2" />
                            Friends
                          </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "friends" && (
          <div>
            {friends.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No friends yet
                  </h3>
                  <p className="text-gray-500">
                    Start by searching for users to connect with!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {friends.map((friend) => (
                  <Card
                    key={friend._id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-gray-200 text-gray-700">
                            {friend.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{friend.username}</h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <div>
            {friendRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No friend requests
                  </h3>
                  <p className="text-gray-500">
                    You'll see incoming friend requests here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {friendRequests.map((request) => {
                  const isLoading = requestLoading[request._id];

                  return (
                    <Card
                      key={request._id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center space-x-3 min-w-0">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-gray-200 text-gray-700">
                                {request.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <h3 className="font-medium truncate">{request.username}</h3>
                              <p className="text-xs text-gray-500 truncate">
                                Sent a friend request
                              </p>
                            </div>
                          </div>

                          <div className="flex-shrink-0 flex space-x-1">
                            <Button
                              onClick={() => acceptFriendRequest(request)}
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 hover:bg-green-50"
                              disabled={isLoading}
                              title="Accept"
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <UserCheck className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                            <Button
                              onClick={() => rejectFriendRequest(request)}
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 hover:bg-red-50"
                              disabled={isLoading}
                              title="Reject"
                            >
                              <UserX className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
