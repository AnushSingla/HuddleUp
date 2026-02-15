import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-500 py-24 px-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 text-center md:text-left">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-4"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                COMMUNITY HUB
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 flex items-center justify-center md:justify-start gap-4">
                Discussion <span className="bg-gradient-to-r from-emerald-500 to-indigo-600 bg-clip-text text-transparent">Arena</span>
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-xl">Deep dives, expert analysis, and passionate sports debates start here.</p>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/create-post">
                <Button className="h-14 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-3">
                  <PlusCircle className="h-5 w-5" />
                  START A DEBATE
                </Button>
              </Link>
            </motion.div>
          </div>

          <div className="w-full bg-white/70 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 md:p-6 shadow-2xl shadow-indigo-500/5 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 h-5 w-5 transition-colors" />
              <Input
                type="text"
                placeholder="Search debates, athletes, or sports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 pl-12 pr-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-emerald-500/20"
              />
            </div>
            <div className="flex items-center gap-3 bg-white dark:bg-zinc-950 px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <Filter className="h-4 w-4 text-emerald-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-sm font-bold text-zinc-600 dark:text-zinc-400 focus:outline-none cursor-pointer pr-4"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="dark:bg-zinc-900">
                    {category.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, idx) => (
              <motion.div
                key={post._id}
                id={`post-${post._id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <PostCard
                  post={post}
                  onDelete={(id) => {
                    setPosts(prev => prev.filter(p => p._id !== id));
                  }}
                />
              </motion.div>
            ))
          ) : (
            <div className="relative py-24 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-8 flex justify-center"
              >
                <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-emerald-400/20 to-indigo-600/20 flex items-center justify-center border border-emerald-500/20">
                  <MessageSquare className="h-10 w-10 text-emerald-500" />
                </div>
              </motion.div>
              <h3 className="text-3xl font-extrabold mb-4">
                {posts.length === 0 ? 'Quiet in the arena...' : 'No debates match...'}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-10 leading-relaxed">
                {posts.length === 0
                  ? 'Be the legend who starts the first discussion in HuddleUp.'
                  : 'Try exploring different categories or search terms to find what you need.'}
              </p>
              {posts.length === 0 && (
                <Link to="/create-post">
                  <Button className="h-14 px-10 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base shadow-lg shadow-emerald-500/20">
                    START THE CONVERSATION
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

