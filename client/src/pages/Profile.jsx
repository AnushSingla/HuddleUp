import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { API } from '@/api';
import PageMeta from '@/components/PageMeta';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Edit2, Save, X, Lock, Users, BookMarked, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', email: '', bio: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [userVideos, setUserVideos] = useState([]);
  const [userPosts, setUserPosts] = useState([]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/auth/profile');
        setUser(res.data.user);
        setEditForm({
          username: res.data.user.username,
          email: res.data.user.email,
          bio: res.data.user.bio || ''
        });
        setLoading(false);
      } catch (err) {
        toast.error('Failed to fetch profile');
        navigate('/login');
      }
    };

    fetchProfile();
  }, [navigate]);

  // Fetch user videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await API.get('/videos');
        const filtered = res.data.filter(v => v.postedBy._id === user?._id);
        setUserVideos(filtered);
      } catch (err) {
        console.error('Error fetching videos:', err);
      }
    };

    if (user?._id) {
      fetchVideos();
    }
  }, [user?._id]);

  // Fetch user posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await API.get('/posts');
        const filtered = res.data.filter(p => p.postedBy === user?._id);
        setUserPosts(filtered);
      } catch (err) {
        console.error('Error fetching posts:', err);
      }
    };

    if (user?._id) {
      fetchPosts();
    }
  }, [user?._id]);

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await API.put('/auth/profile', editForm);
      setUser({ ...user, ...editForm });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await API.put('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PageMeta title="Profile" description="Your HuddleUp profile." />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PageMeta title="Profile" description="Your HuddleUp profile." />
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Profile Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 py-8 px-4">
      <PageMeta title="My profile" description="Manage your HuddleUp profile, videos, and posts." />
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <Card className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-blue-500/30 overflow-hidden">
          <CardHeader className="pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              {/* Avatar and User Info */}
              <div className="flex items-start gap-6 flex-1">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center border-2 border-cyan-400/50 shadow-lg">
                    <span className="text-4xl font-bold text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 pt-2">
                  <h1 className="text-2xl font-bold text-white mb-2">{user.username}</h1>
                  <p className="text-zinc-400 text-sm mb-3">{user.email}</p>
                  {user.bio && <p className="text-zinc-300 text-sm mb-3 max-w-md">{user.bio}</p>}
                  <p className="text-xs text-zinc-500">
                    Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Edit Button */}
              {!isEditing && (
                <Button
                onClick={() => setIsEditing(true)}
                className="!w-auto !px-3 !py-1.5 !text-sm"
                variant="outline"
              >
                Edit Profile
              </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-xl transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2)'
            }}
          >
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-400 mb-2">{userVideos.length}</p>
              <p className="text-white/80 text-sm font-medium">Videos</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #7e22ce 0%, #a855f7 100%)',
              boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)'
            }}
          >
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-400 mb-2">{userPosts.length}</p>
              <p className="text-white/80 text-sm font-medium">Posts</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-xl transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #be185d 0%, #ec4899 100%)',
              boxShadow: '0 4px 20px rgba(236, 72, 153, 0.2)'
            }}
          >
            <div className="text-center">
              <p className="text-4xl font-bold text-pink-400 mb-2">{user.friendsCount || 0}</p>
              <p className="text-white/80 text-sm font-medium">Friends</p>
            </div>
          </motion.div>
        </div>

        {/* Edit Profile Section */}
        {isEditing && (
          <Card className="border-blue-500/50 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-2xl">Edit Profile</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                  <Input
                    id="username"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    placeholder="Enter new username"
                    className="bg-slate-800 border-slate-700 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="Enter new email"
                    className="bg-slate-800 border-slate-700 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Tell us about yourself"
                    className="bg-slate-800 border-slate-700 focus:border-blue-500 resize-none"
                    rows={4}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <Save size={18} />
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        username: user.username,
                        email: user.email,
                        bio: user.bio || ''
                      });
                    }}
                    className="gap-2"
                  >
                    <X size={18} />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tabs Section */}
        <Card className="bg-slate-900/50">
          <CardHeader className="pb-0">
            <div className="flex gap-1 border-b border-slate-700 -mx-6 px-6">
              <button
                onClick={() => setActiveTab('info')}
                className={`pb-4 px-4 font-medium text-sm transition-all duration-200 flex items-center gap-2 ${activeTab === 'info'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-zinc-400 hover:text-white'
                  }`}
              >
                <BookMarked size={16} />
                Profile Info
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`pb-4 px-4 font-medium text-sm transition-all duration-200 ${activeTab === 'videos'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-zinc-400 hover:text-white'
                  }`}
              >
                Videos ({userVideos.length})
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`pb-4 px-4 font-medium text-sm transition-all duration-200 ${activeTab === 'posts'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-zinc-400 hover:text-white'
                  }`}
              >
                Posts ({userPosts.length})
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`pb-4 px-4 font-medium text-sm transition-all duration-200 flex items-center gap-2 ${activeTab === 'security'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-zinc-400 hover:text-white'
                  }`}
              >
                <Lock size={16} />
                Security
              </button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Profile Info Tab */}
            {activeTab === 'info' && (
              <div className="space-y-8 max-w-2xl">
                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Username</Label>
                  <p className="text-base font-medium text-white">{user.username}</p>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Email</Label>
                  <p className="text-base font-medium text-white">{user.email}</p>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Bio</Label>
                  <p className="text-base text-zinc-300">{user.bio || 'No bio provided.'}</p>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Member Since</Label>
                  <p className="text-base font-medium text-white">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Videos Tab */}
            {activeTab === 'videos' && (
              <div className="space-y-4">
                {userVideos.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-zinc-400 mb-4">No videos uploaded yet</p>
                    <Button onClick={() => navigate('/upload')} className="bg-blue-600 hover:bg-blue-700">
                      Upload Video
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userVideos.map((video) => (
                      <Card key={video._id} className="overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                        <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                          <span className="text-zinc-500 text-sm">Video Thumbnail</span>
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm line-clamp-2">{video.title}</CardTitle>
                          <CardDescription className="line-clamp-2">{video.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-zinc-500">
                            {new Date(video.createdAt).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {userPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-zinc-400 mb-4">No posts created yet</p>
                    <Button onClick={() => navigate('/create-post')} className="bg-blue-600 hover:bg-blue-700">
                      Create Post
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userPosts.map((post) => (
                      <Card key={post._id} className="hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                        <CardHeader>
                          <CardTitle className="text-base">{post.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-zinc-300 mb-3">{post.content}</p>
                          <p className="text-xs text-zinc-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-white">
                    <Lock size={20} className="text-blue-400" />
                    Change Password
                  </h3>
                </div>
                <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter your current password"
                      className="bg-slate-800 border-slate-700 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter your new password"
                      className="bg-slate-800 border-slate-700 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Confirm your new password"
                      className="bg-slate-800 border-slate-700 focus:border-blue-500"
                      required
                    />
                  </div>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 gap-2 w-full">
                    <Lock size={18} />
                    Update Password
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
