import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import  Textarea  from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { PenTool, Send } from 'lucide-react';
import { API } from '@/api';
import { getToken } from '@/utils/auth';
import PageWrapper from '@/components/ui/PageWrapper';
import PageMeta from '@/components/PageMeta';

const CreatePost = () => {
  const location = useLocation();
  const editPost = location.state?.editPost;

  const [title, setTitle] = useState(editPost?.title ?? '');
  const [content, setContent] = useState(editPost?.content ?? '');
  const [category, setCategory] = useState(editPost?.category ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const isEditMode = Boolean(editPost?._id);

  useEffect(() => {
    if (editPost) {
      setTitle(editPost.title ?? '');
      setContent(editPost.content ?? '');
      setCategory(editPost.category ?? '');
    }
  }, [editPost]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    if (!getToken()) {
      toast.error("Please login first");
      navigate('/login');
      return;
    }

    try {
      if (isEditMode) {
        await API.put(`/posts/${editPost._id}`, {
          title,
          content,
          category: category || "General"
        });
        toast.success("Post updated successfully");
      } else {
        await API.post('/posts', {
          title,
          content,
          category: category || "General"
        }, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        toast.success("Your post has been created successfully");
      }
      navigate('/posts');
    } catch (error) {
      console.error('Error creating/updating post:', error);
      toast.error(error.response?.data?.message || (isEditMode ? "Failed to update post." : "Failed to create post. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <PageMeta title={isEditMode ? 'Edit post' : 'Create post'} description={isEditMode ? 'Edit your post on HuddleUp.' : 'Create a new post and join the sports discussion on HuddleUp.'} />
    <div className="min-h-screen py-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: 'var(--text-main)' }}>
            <PenTool className="h-8 w-8" style={{ color: 'var(--turf-green)' }} />
            {isEditMode ? 'Edit Post' : 'Create New Post'}
          </h1>
          <p style={{ color: 'var(--text-sub)' }}>{isEditMode ? 'Update your post below' : 'Share your thoughts with the sports community'}</p>
        </div>

        <div className="rounded-lg p-8" style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)'
        }}>
          <h2 className="text-xl mb-6 font-semibold" style={{ color: 'var(--accent)' }}>
            {isEditMode ? 'Edit Your Post' : 'Write Your Post'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                Title *
              </label>
              <Input
                type="text"
                placeholder="Enter post title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{
                  background: 'var(--bg-surface)',
                  border: '2px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  padding: '0.75rem'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                Category
              </label>
              <Input
                type="text"
                placeholder="e.g., Match Discussion, Player Analysis, News..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '2px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  padding: '0.75rem'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                Content *
              </label>
              <Textarea
                  placeholder="Write your post content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] resize-none"
                  required
                  style={{
                    background: 'var(--bg-surface)',
                    border: '2px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    padding: '0.75rem',
                    lineHeight: 'var(--lh-relaxed)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 font-semibold flex items-center gap-2 hover-lift disabled:opacity-50"
                  style={{
                    background: 'var(--turf-green)',
                    color: 'var(--bg-primary)',
                    borderRadius: 'var(--r-md)',
                    transition: 'all var(--transition-base)'
                  }}
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Post')}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/posts')}
                  className="px-6 py-3 font-semibold hover-lift"
                  style={{
                    background: 'transparent',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--r-md)',
                    transition: 'all var(--transition-base)'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default CreatePost;
