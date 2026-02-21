import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import  Badge  from "@/components/ui/badge";
import PageWrapper from "@/components/ui/PageWrapper";
import { Trash2, AlertTriangle, CheckCircle, Video, FileText, MessageSquare, Users, Flag, BarChart3 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL ;

export default function Admin() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        flaggedPosts: 0,
        flaggedVideos: 0,
        flaggedComments: 0,
        totalUsers: 0,
        totalPosts: 0,
        totalVideos: 0
    });
    const [flaggedPosts, setFlaggedPosts] = useState([]);
    const [flaggedVideos, setFlaggedVideos] = useState([]);
    const [flaggedComments, setFlaggedComments] = useState([]);

    useEffect(() => {
        checkAdminAccess();
    }, []);

    useEffect(() => {
        if (isAdmin) {
            if (activeTab === 'overview') {
                fetchStats();
            } else if (activeTab === 'posts') {
                fetchFlaggedPosts();
            } else if (activeTab === 'videos') {
                fetchFlaggedVideos();
            } else if (activeTab === 'comments') {
                fetchFlaggedComments();
            }
        }
    }, [isAdmin, activeTab]);

    const checkAdminAccess = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login first');
                navigate('/login');
                return;
            }

            const response = await axios.get(`${API_URL}/admin/check-admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.isAdmin) {
                setIsAdmin(true);
                fetchStats();
            } else {
                toast.error('Access denied. Admin only.');
                navigate('/');
            }
        } catch (error) {
            toast.error('Access denied');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            toast.error('Error fetching statistics');
        }
    };

    const fetchFlaggedPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/admin/flagged/posts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFlaggedPosts(response.data);
        } catch (error) {
            toast.error('Error fetching flagged posts');
        }
    };

    const fetchFlaggedVideos = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/admin/flagged/videos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFlaggedVideos(response.data);
        } catch (error) {
            toast.error('Error fetching flagged videos');
        }
    };

    const fetchFlaggedComments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/admin/flagged/comments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFlaggedComments(response.data);
        } catch (error) {
            toast.error('Error fetching flagged comments');
        }
    };

    const handleDeletePost = (id) => {
        toast('Are you sure you want to delete this post?', {
            action: {
                label: 'Delete',
                onClick: async () => {
                    try {
                        const token = localStorage.getItem('token');
                        await axios.delete(`${API_URL}/admin/posts/${id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        toast.success('Post deleted successfully');
                        fetchFlaggedPosts();
                        fetchStats();
                    } catch (error) {
                        toast.error('Error deleting post');
                    }
                },
            },
            cancel: {
                label: 'Cancel',
            },
        });
    };

    const handleDeleteVideo = (id) => {
        toast('Are you sure you want to delete this video?', {
            action: {
                label: 'Delete',
                onClick: async () => {
                    try {
                        const token = localStorage.getItem('token');
                        await axios.delete(`${API_URL}/admin/videos/${id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        toast.success('Video deleted successfully');
                        fetchFlaggedVideos();
                        fetchStats();
                    } catch (error) {
                        toast.error('Error deleting video');
                    }
                },
            },
            cancel: {
                label: 'Cancel',
            },
        });
    };

    const handleDeleteComment = async (id) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/admin/comments/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Comment deleted successfully');
            fetchFlaggedComments();
            fetchStats();
        } catch (error) {
            toast.error('Error deleting comment');
        }
    };

    const handleDismissFlag = async (type, id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/admin/dismiss-flag`, 
                { type, id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Flag dismissed successfully');
            
            if (type === 'post') fetchFlaggedPosts();
            else if (type === 'video') fetchFlaggedVideos();
            else if (type === 'comment') fetchFlaggedComments();
            
            fetchStats();
        } catch (error) {
            toast.error('Error dismissing flag');
        }
    };

    if (loading) {
        return (
            <PageWrapper>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-zinc-400">Loading...</div>
                </div>
            </PageWrapper>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <PageWrapper>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="border-b border-zinc-800 pb-6">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                        Admin Moderation Panel
                    </h1>
                    <p className="text-zinc-400 mt-2">Review and manage flagged content across the platform</p>
                </div>

                {/* Stats Overview */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400">Flagged Posts</CardTitle>
                                <FileText className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{stats.flaggedPosts}</div>
                                <p className="text-xs text-zinc-500 mt-1">Total: {stats.totalPosts} posts</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400">Flagged Videos</CardTitle>
                                <Video className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{stats.flaggedVideos}</div>
                                <p className="text-xs text-zinc-500 mt-1">Total: {stats.totalVideos} videos</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400">Flagged Comments</CardTitle>
                                <MessageSquare className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{stats.flaggedComments}</div>
                                <p className="text-xs text-zinc-500 mt-1">Requires review</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 border-b border-zinc-800">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === 'overview'
                                ? 'text-white border-b-2 border-indigo-500'
                                : 'text-zinc-400 hover:text-zinc-300'
                        }`}
                    >
                        <BarChart3 className="inline h-4 w-4 mr-2" />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === 'posts'
                                ? 'text-white border-b-2 border-indigo-500'
                                : 'text-zinc-400 hover:text-zinc-300'
                        }`}
                    >
                        <FileText className="inline h-4 w-4 mr-2" />
                        Posts ({stats.flaggedPosts})
                    </button>
                    <button
                        onClick={() => setActiveTab('videos')}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === 'videos'
                                ? 'text-white border-b-2 border-indigo-500'
                                : 'text-zinc-400 hover:text-zinc-300'
                        }`}
                    >
                        <Video className="inline h-4 w-4 mr-2" />
                        Videos ({stats.flaggedVideos})
                    </button>
                    <button
                        onClick={() => setActiveTab('comments')}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === 'comments'
                                ? 'text-white border-b-2 border-indigo-500'
                                : 'text-zinc-400 hover:text-zinc-300'
                        }`}
                    >
                        <MessageSquare className="inline h-4 w-4 mr-2" />
                        Comments ({stats.flaggedComments})
                    </button>
                </div>

                {/* Flagged Posts */}
                {activeTab === 'posts' && (
                    <div className="space-y-4">
                        {flaggedPosts.length === 0 ? (
                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardContent className="py-8 text-center text-zinc-400">
                                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                                    No flagged posts to review
                                </CardContent>
                            </Card>
                        ) : (
                            flaggedPosts.map(post => (
                                <Card key={post._id} className="bg-zinc-900 border-zinc-800">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-white">{post.title}</CardTitle>
                                                <CardDescription className="mt-2">
                                                    <span className="text-zinc-400">By: {post.postedBy?.username || 'Unknown'}</span>
                                                    <span className="mx-2">•</span>
                                                    <span className="text-zinc-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                                                </CardDescription>
                                            </div>
                                            <Badge variant="destructive" className="ml-4">
                                                <Flag className="h-3 w-3 mr-1" />
                                                Flagged by {post.flaggedBy?.length || 0} user(s)
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-zinc-300 mb-4">{post.content}</p>
                                        {post.flagReason && (
                                            <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3 mb-4">
                                                <p className="text-sm text-red-400">
                                                    <strong>Reason:</strong> {post.flagReason}
                                                </p>
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleDeletePost(post._id)}
                                                variant="destructive"
                                                size="sm"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Post
                                            </Button>
                                            <Button
                                                onClick={() => handleDismissFlag('post', post._id)}
                                                variant="outline"
                                                size="sm"
                                                className="border-zinc-700 hover:bg-zinc-800"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Dismiss Flag
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}

                {/* Flagged Videos */}
                {activeTab === 'videos' && (
                    <div className="space-y-4">
                        {flaggedVideos.length === 0 ? (
                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardContent className="py-8 text-center text-zinc-400">
                                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                                    No flagged videos to review
                                </CardContent>
                            </Card>
                        ) : (
                            flaggedVideos.map(video => (
                                <Card key={video._id} className="bg-zinc-900 border-zinc-800">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-white">{video.title}</CardTitle>
                                                <CardDescription className="mt-2">
                                                    <span className="text-zinc-400">By: {video.postedBy?.username || 'Unknown'}</span>
                                                    <span className="mx-2">•</span>
                                                    <span className="text-zinc-400">{new Date(video.createdAt).toLocaleDateString()}</span>
                                                </CardDescription>
                                            </div>
                                            <Badge variant="destructive" className="ml-4">
                                                <Flag className="h-3 w-3 mr-1" />
                                                Flagged by {video.flaggedBy?.length || 0} user(s)
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-zinc-300 mb-4">{video.description}</p>
                                        {video.flagReason && (
                                            <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3 mb-4">
                                                <p className="text-sm text-red-400">
                                                    <strong>Reason:</strong> {video.flagReason}
                                                </p>
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleDeleteVideo(video._id)}
                                                variant="destructive"
                                                size="sm"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Video
                                            </Button>
                                            <Button
                                                onClick={() => handleDismissFlag('video', video._id)}
                                                variant="outline"
                                                size="sm"
                                                className="border-zinc-700 hover:bg-zinc-800"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Dismiss Flag
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}

                {/* Flagged Comments */}
                {activeTab === 'comments' && (
                    <div className="space-y-4">
                        {flaggedComments.length === 0 ? (
                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardContent className="py-8 text-center text-zinc-400">
                                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                                    No flagged comments to review
                                </CardContent>
                            </Card>
                        ) : (
                            flaggedComments.map(comment => (
                                <Card key={comment._id} className="bg-zinc-900 border-zinc-800">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-sm text-zinc-400">
                                                    Comment on: {comment.videoId?.title || comment.postId?.title || 'Unknown'}
                                                </CardTitle>
                                                <CardDescription className="mt-2">
                                                    <span className="text-zinc-400">By: {comment.userId?.username || 'Unknown'}</span>
                                                    <span className="mx-2">•</span>
                                                    <span className="text-zinc-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                </CardDescription>
                                            </div>
                                            <Badge variant="destructive" className="ml-4">
                                                <Flag className="h-3 w-3 mr-1" />
                                                Flagged by {comment.flaggedBy?.length || 0} user(s)
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-zinc-300 mb-4">{comment.text}</p>
                                        {comment.flagReason && (
                                            <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3 mb-4">
                                                <p className="text-sm text-red-400">
                                                    <strong>Reason:</strong> {comment.flagReason}
                                                </p>
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleDeleteComment(comment._id)}
                                                variant="destructive"
                                                size="sm"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Comment
                                            </Button>
                                            <Button
                                                onClick={() => handleDismissFlag('comment', comment._id)}
                                                variant="outline"
                                                size="sm"
                                                className="border-zinc-700 hover:bg-zinc-800"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Dismiss Flag
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </div>
        </PageWrapper>
    );
}
