import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PostCard from './PostCard';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, MessageSquare, Filter } from 'lucide-react';
import { API } from '@/api';
import PageWrapper from '@/components/ui/PageWrapper';

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
    <PageWrapper>
    <div className="min-h-screen py-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-2 flex items-center gap-3" 
                style={{ color: 'var(--text-main)' }}>
                <MessageSquare className="h-10 w-10" style={{ color: 'var(--turf-green)' }} />
                Sports Discussion Arena
              </h1>
              <p className="text-lg" style={{ color: 'var(--text-sub)' }}>
                Join the debate • Share your take • Connect with fans worldwide
              </p>
            </div>
            <Link to="/create-post">
              <button className="px-6 py-3 font-bold flex items-center gap-2 transition-all hover:scale-105" 
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  borderRadius: 'var(--r-md)',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
                }}>
                <PlusCircle className="h-5 w-5" />
                Start a Debate
              </button>
            </Link>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-6 rounded-xl" style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" 
                  style={{ color: 'var(--text-sub)' }} />
                <Input
                  type="text"
                  placeholder="Search discussions, topics, or users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-3"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '2px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg" 
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}>
                <Filter className="h-5 w-5" style={{ color: 'var(--text-sub)' }} />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent outline-none font-medium"
                  style={{ color: 'var(--text-main)' }}
                >
                  {categories.map(category => (
                    <option key={category} value={category} 
                      style={{ background: 'var(--bg-surface)' }}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="space-y-4">
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
            <div className="text-center py-20 px-6 rounded-xl" 
              style={{ 
                background: 'var(--bg-surface)',
                border: '2px dashed var(--border-medium)'
              }}>
              <MessageSquare className="h-20 w-20 mx-auto mb-6" 
                style={{ color: 'var(--border-medium)' }} />
              <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-main)' }}>
                {posts.length === 0 ? 'No debates yet!' : 'No debates found'}
              </h3>
              <p className="text-lg mb-8 max-w-md mx-auto" style={{ color: 'var(--text-sub)' }}>
                {posts.length === 0
                  ? 'Be the first to spark a discussion in the sports arena!'
                  : 'Try adjusting your search or filter to find more discussions'}
              </p>
              {posts.length === 0 && (
                <Link to="/create-post">
                  <button className="px-8 py-4 font-bold text-lg transition-all hover:scale-105" 
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      borderRadius: 'var(--r-md)',
                      boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
                    }}>
                    Start First Debate
                  </button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </PageWrapper>
  );
};

export default AllPosts;

