import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import  Textarea  from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { PenTool, Send } from 'lucide-react';
import { API } from '@/api';
import { getToken } from '@/utils/auth';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <PenTool className="h-8 w-8 text-green-600" />
            {isEditMode ? 'Edit Post' : 'Create New Post'}
          </h1>
          <p className="text-gray-600">{isEditMode ? 'Update your post below' : 'Share your thoughts with the sports community'}</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-blue-600">{isEditMode ? 'Edit Your Post' : 'Write Your Post'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <Input
                  type="text"
                  placeholder="Enter post title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Match Discussion, Player Analysis, News..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <Textarea
                  placeholder="Write your post content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] resize-none"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Post')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/posts')}
                  className="text-gray-700 border-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatePost;
