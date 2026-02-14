import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: 'var(--text-main)' }}>
                <MessageSquare className="h-8 w-8" style={{ color: 'var(--turf-green)' }} />
                Discussion Forum
              </h1>
              <p style={{ color: 'var(--text-sub)' }}>Join the sports community discussion</p>
            </div>
            <Link to="/create-post">
              <button className="px-6 py-3 font-semibold flex items-center gap-2 hover-lift" style={{
                background: 'var(--turf-green)',
                color: 'var(--bg-primary)',
                borderRadius: 'var(--r-md)',
                transition: 'all var(--transition-base)'
              }}>
                <PlusCircle className="h-5 w-5" />
                Create Post
              </button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-sub)' }} />
              <Input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)'
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" style={{ color: 'var(--text-sub)' }} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-md focus:outline-none focus:ring-2"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--turf-green)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
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
              <MessageSquare className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--border-subtle)' }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-sub)' }}>
                {posts.length === 0 ? 'No posts yet' : 'No posts found'}
              </h3>
              <p className="mb-6" style={{ color: 'var(--text-sub)' }}>
                {posts.length === 0
                  ? 'Be the first to start a discussion!'
                  : 'Try adjusting your search or filter criteria'}
              </p>
              {posts.length === 0 && (
                <Link to="/create-post">
                  <button className="px-6 py-3 font-semibold hover-lift" style={{
                    background: 'var(--turf-green)',
                    color: 'var(--bg-primary)',
                    borderRadius: 'var(--r-md)',
                    transition: 'all var(--transition-base)'
                  }}>
                    Create First Post
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

