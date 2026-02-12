import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PostCard from './PostCard';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, MessageSquare, Filter } from 'lucide-react';
import { API } from '@/api';

const AllPosts = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);

  const fetchPosts = async () => {
    try {
      const res = await API.get('/posts');
      const postsData = Array.isArray(res.data) ? res.data : [];
      setPosts(postsData);
      setFilteredPosts(postsData);
      const uniqueCategories = ['All', ...new Set(postsData.map(post => post?.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Refetch when we navigate back to this page (e.g. after edit) so list shows updated content
  useEffect(() => {
    if (location.pathname === '/posts') fetchPosts();
  }, [location.pathname]);

  // Scroll to post when opening a shared link (e.g. /posts?post=id)
  const highlightPostId = searchParams.get('post');
  useEffect(() => {
    if (!highlightPostId || posts.length === 0) return;
    const el = document.getElementById(`post-${highlightPostId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightPostId, posts]);

  useEffect(() => {
    let filtered = posts;

    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    setFilteredPosts(filtered);
  }, [posts, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-green-600" />
                Discussion Forum
              </h1>
              <p className="text-gray-600">Join the sports community discussion</p>
            </div>
            <Link to="/create-post">
              <Button className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Create Post
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <div key={post._id} id={`post-${post._id}`}>
                <PostCard
                  post={post}
                  onDelete={(id) => {
                    setPosts(prev => prev.filter(p => p._id !== id));
                  }}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {posts.length === 0 ? 'No posts yet' : 'No posts found'}
              </h3>
              <p className="text-gray-500 mb-6">
                {posts.length === 0
                  ? 'Be the first to start a discussion!'
                  : 'Try adjusting your search or filter criteria'}
              </p>
              {posts.length === 0 && (
                <Link to="/create-post">
                  <Button className="bg-green-500 hover:bg-green-600 text-white">
                    Create First Post
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllPosts;

