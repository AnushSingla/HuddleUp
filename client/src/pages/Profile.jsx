import React, { useEffect, useState } from 'react';
import { API } from '@/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Edit2, Save, X, Lock, Users, BookMarked } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{user.username}</h1>
              <p className="text-zinc-400">{user.email}</p>
              {user.bio && <p className="text-zinc-300 mt-2 italic">{user.bio}</p>}
              <p className="text-sm text-zinc-500 mt-2">
                Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long'
                })}
              </p>
            </div>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-blue-400">{userVideos.length}</p>
            <p className="text-zinc-400 text-sm">Videos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-purple-400">{userPosts.length}</p>
            <p className="text-zinc-400 text-sm">Posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-pink-400">{user.friendsCount || 0}</p>
            <p className="text-zinc-400 text-sm">Friends</p>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Section */}
      {isEditing && (
        <Card className="border-blue-500/50">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  placeholder="Enter new username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="Enter new email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell us about yourself"
                  className="bg-zinc-900 border-zinc-700"
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="gap-2">
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
      <Card>
        <CardHeader>
          <div className="flex gap-4 border-b border-zinc-700">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-4 px-2 font-semibold transition-colors ${activeTab === 'info'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-zinc-400 hover:text-white'
                }`}
            >
              <div className="flex items-center gap-2">
                <BookMarked size={18} />
                Profile Info
              </div>
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`pb-4 px-2 font-semibold transition-colors ${activeTab === 'videos'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-zinc-400 hover:text-white'
                }`}
            >
              Videos ({userVideos.length})
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-4 px-2 font-semibold transition-colors ${activeTab === 'posts'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-zinc-400 hover:text-white'
                }`}
            >
              Posts ({userPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`pb-4 px-2 font-semibold transition-colors ${activeTab === 'security'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-zinc-400 hover:text-white'
                }`}
            >
              <div className="flex items-center gap-2">
                <Lock size={18} />
                Security
              </div>
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Profile Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div>
                <Label className="text-zinc-400">Username</Label>
                <p className="text-lg font-semibold">{user.username}</p>
              </div>
              <div>
                <Label className="text-zinc-400">Email</Label>
                <p className="text-lg font-semibold">{user.email}</p>
              </div>
              <div>
                <Label className="text-zinc-400">Bio</Label>
                <p className="text-lg">{user.bio || 'No bio provided.'}</p>
              </div>
              <div>
                <Label className="text-zinc-400">Member Since</Label>
                <p className="text-lg font-semibold">
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
                <div className="text-center py-8">
                  <p className="text-zinc-400">No videos uploaded yet</p>
                  <Button onClick={() => navigate('/upload')} className="mt-4">
                    Upload Video
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userVideos.map((video) => (
                    <Card key={video._id} className="overflow-hidden">
                      <div className="aspect-video bg-zinc-900 flex items-center justify-center">
                        <span className="text-zinc-400">Video Thumbnail</span>
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
                <div className="text-center py-8">
                  <p className="text-zinc-400">No posts created yet</p>
                  <Button onClick={() => navigate('/create-post')} className="mt-4">
                    Create Post
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userPosts.map((post) => (
                    <Card key={post._id}>
                      <CardHeader>
                        <CardTitle className="text-base">{post.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-zinc-300 mb-2">{post.content}</p>
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
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Lock size={20} />
                  Change Password
                </h3>
              </div>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Enter your current password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Enter your new password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Confirm your new password"
                    required
                  />
                </div>
                <Button type="submit" className="gap-2">
                  <Lock size={18} />
                  Update Password
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
