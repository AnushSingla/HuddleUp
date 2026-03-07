import React, { useState, useEffect } from 'react';
import { API } from '@/api';
import PageMeta from '@/components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  RotateCcw, 
  Clock, 
  AlertTriangle,
  Video,
  FileText,
  MessageCircle,
  List,
  Calendar,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const getContentIcon = (type) => {
  switch (type) {
    case 'video': return Video;
    case 'post': return FileText;
    case 'comment': return MessageCircle;
    case 'playlist': return List;
    default: return FileText;
  }
};

const getContentTypeColor = (type) => {
  switch (type) {
    case 'video': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'post': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'comment': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'playlist': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export default function DeletedContent() {
  const [deletedContent, setDeletedContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(new Set());
  const [permanentDeleting, setPermanentDeleting] = useState(new Set());
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadDeletedContent();
  }, [activeTab]);

  const loadDeletedContent = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/user/deleted?type=${activeTab}`);
      setDeletedContent(response.data.data);
    } catch (error) {
      toast.error('Failed to load deleted content');
      console.error('Error loading deleted content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (type, id) => {
    setRestoring(prev => new Set(prev).add(`${type}-${id}`));
    
    try {
      await API.post(`/user/restore/${type}/${id}`);
      toast.success(`${type} restored successfully`);
      loadDeletedContent();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to restore content';
      toast.error(errorMsg);
    } finally {
      setRestoring(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${type}-${id}`);
        return newSet;
      });
    }
  };

  const handlePermanentDelete = async (type, id) => {
    if (!confirm(`Are you sure you want to permanently delete this ${type}? This action cannot be undone.`)) {
      return;
    }

    setPermanentDeleting(prev => new Set(prev).add(`${type}-${id}`));
    
    try {
      await API.delete(`/user/permanent/${type}/${id}`);
      toast.success(`${type} permanently deleted`);
      loadDeletedContent();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to permanently delete content';
      toast.error(errorMsg);
    } finally {
      setPermanentDeleting(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${type}-${id}`);
        return newSet;
      });
    }
  };

  const getDaysRemaining = (deletedAt) => {
    const deletedDate = new Date(deletedAt);
    const expiryDate = new Date(deletedDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
    const now = new Date();
    const daysRemaining = Math.ceil((expiryDate - now) / (24 * 60 * 60 * 1000));
    return Math.max(0, daysRemaining);
  };

  const renderContentItem = (item, type) => {
    const Icon = getContentIcon(type);
    const daysRemaining = getDaysRemaining(item.deletedAt);
    const canRestore = daysRemaining > 0;
    const isRestoring = restoring.has(`${type}-${item._id}`);
    const isPermanentDeleting = permanentDeleting.has(`${type}-${item._id}`);

    return (
      <Card key={item._id} className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 bg-gray-700 rounded-lg">
                <Icon className="w-6 h-6 text-gray-300" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-white font-medium">
                    {item.title || item.text || item.name || 'Untitled'}
                  </h3>
                  <Badge className={getContentTypeColor(type)}>
                    {type}
                  </Badge>
                  {!canRestore && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      Expired
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Deleted {formatDistanceToNow(new Date(item.deletedAt))} ago</span>
                  </div>
                  {item.deleteReason && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Reason: {item.deleteReason}</span>
                    </div>
                  )}
                  {canRestore && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className={daysRemaining <= 7 ? 'text-orange-400' : ''}>
                        {daysRemaining} days remaining to restore
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {canRestore && (
                <Button
                  onClick={() => handleRestore(type, item._id)}
                  disabled={isRestoring}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isRestoring ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Restoring...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restore
                    </>
                  )}
                </Button>
              )}
              
              <Button
                onClick={() => handlePermanentDelete(type, item._id)}
                disabled={isPermanentDeleting}
                size="sm"
                variant="destructive"
              >
                {isPermanentDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Forever
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getAllItems = () => {
    const allItems = [];
    
    Object.entries(deletedContent).forEach(([type, data]) => {
      if (data && data.documents) {
        data.documents.forEach(item => {
          allItems.push({ ...item, type });
        });
      }
    });
    
    return allItems.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
  };

  const getTotalCount = () => {
    return Object.values(deletedContent).reduce((total, data) => {
      return total + (data?.pagination?.total || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading deleted content...</div>
      </div>
    );
  }

  const totalCount = getTotalCount();

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <PageMeta 
        title="Deleted Content" 
        description="Manage your deleted content and restore items within 30 days" 
      />
      
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Deleted Content</h1>
          <p className="text-gray-400">
            You can restore deleted content within 30 days. After that, it will be permanently removed.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', count: totalCount },
              { key: 'videos', label: 'Videos', count: deletedContent.videos?.pagination?.total || 0 },
              { key: 'posts', label: 'Posts', count: deletedContent.posts?.pagination?.total || 0 },
              { key: 'comments', label: 'Comments', count: deletedContent.comments?.pagination?.total || 0 },
              { key: 'playlists', label: 'Playlists', count: deletedContent.playlists?.pagination?.total || 0 }
            ].map(tab => (
              <Button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                variant={activeTab === tab.key ? "default" : "outline"}
                className={`${
                  activeTab === tab.key 
                    ? 'bg-blue-600 text-white' 
                    : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {tab.label} ({tab.count})
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {totalCount === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="py-12 text-center">
                <Trash2 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-white font-medium mb-2">No deleted content</h3>
                <p className="text-gray-400">You don't have any deleted content to restore.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {activeTab === 'all' ? (
                getAllItems().map(item => renderContentItem(item, item.type))
              ) : (
                deletedContent[activeTab]?.documents?.map(item => 
                  renderContentItem(item, activeTab.slice(0, -1)) // Remove 's' from plural
                ) || []
              )}
            </>
          )}
        </div>

        {/* Info Card */}
        <Card className="mt-8 bg-blue-900/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Important Information</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Deleted content can be restored within 30 days</li>
                  <li>• After 30 days, content is permanently removed and cannot be recovered</li>
                  <li>• Restoring content will make it visible to other users again</li>
                  <li>• You can permanently delete content at any time if you're sure you don't want it back</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}