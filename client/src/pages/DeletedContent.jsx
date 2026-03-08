import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ArrowLeft,
  CheckSquare,
  Square
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
  const navigate = useNavigate();
  const [deletedContent, setDeletedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(new Set());
  const [permanentDeleting, setPermanentDeleting] = useState(new Set());
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [bulkRestoring, setBulkRestoring] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadDeletedContent();
  }, [activeTab]);

  const loadDeletedContent = async () => {
    try {
      setLoading(true);
      const response = await API.get('/user/deleted');
      
      // Flatten the response data and add recovery info
      const allContent = [];
      Object.entries(response.data.data || {}).forEach(([type, items]) => {
        if (Array.isArray(items)) {
          items.forEach(item => {
            const recoveryWindow = 30 * 24 * 60 * 60 * 1000; // 30 days
            const deletedAt = new Date(item.deletedAt);
            const expiresAt = new Date(deletedAt.getTime() + recoveryWindow);
            const now = new Date();
            const daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
            
            allContent.push({
              ...item,
              contentType: type.slice(0, -1), // Remove 's' from 'videos', 'posts', etc.
              expiresAt,
              daysRemaining: Math.max(0, daysRemaining),
              canRestore: expiresAt > now,
              isExpiringSoon: daysRemaining <= 7 && daysRemaining > 0
            });
          });
        }
      });

      // Filter by active tab
      let filteredContent = allContent;
      if (activeTab !== 'all') {
        filteredContent = allContent.filter(item => item.contentType === activeTab);
      }

      // Sort by deletion date (newest first)
      filteredContent.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));

      setDeletedContent(filteredContent);
      setSelectedItems(new Set()); // Clear selections when data changes
    } catch (error) {
      toast.error('Failed to load deleted content');
      console.error('Error loading deleted content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (item) => {
    const itemKey = `${item.contentType}-${item._id}`;
    setRestoring(prev => new Set(prev).add(itemKey));
    
    try {
      await API.post(`/user/deleted/restore/${item.contentType}/${item._id}`);
      toast.success(`${item.contentType} restored successfully`);
      loadDeletedContent();
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || 'Failed to restore content';
      toast.error(errorMsg);
    } finally {
      setRestoring(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const handlePermanentDelete = async (item) => {
    const itemKey = `${item.contentType}-${item._id}`;
    
    if (!confirm(`Are you sure you want to permanently delete this ${item.contentType}? This action cannot be undone.`)) {
      return;
    }

    setPermanentDeleting(prev => new Set(prev).add(itemKey));
    
    try {
      await API.delete(`/user/deleted/permanent/${item.contentType}/${item._id}`);
      toast.success(`${item.contentType} permanently deleted`);
      loadDeletedContent();
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || 'Failed to permanently delete content';
      toast.error(errorMsg);
    } finally {
      setPermanentDeleting(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const handleBulkRestore = async () => {
    if (selectedItems.size === 0) {
      toast.error('Please select items to restore');
      return;
    }

    setBulkRestoring(true);
    
    try {
      const itemsToRestore = Array.from(selectedItems).map(itemKey => {
        const [type, id] = itemKey.split('-');
        return { type, id };
      });

      await API.post('/user/deleted/bulk-restore', { items: itemsToRestore });
      toast.success(`${selectedItems.size} items restored successfully`);
      loadDeletedContent();
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || 'Failed to restore selected items';
      toast.error(errorMsg);
    } finally {
      setBulkRestoring(false);
    }
  };

  const toggleItemSelection = (item) => {
    const itemKey = `${item.contentType}-${item._id}`;
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === deletedContent.length) {
      setSelectedItems(new Set());
    } else {
      const allItems = new Set(deletedContent.map(item => `${item.contentType}-${item._id}`));
      setSelectedItems(allItems);
    }
  };

  const getContentTitle = (item) => {
    return item.title || item.name || item.text || 'Untitled';
  };

  const tabs = [
    { id: 'all', label: 'All', count: deletedContent.length },
    { id: 'video', label: 'Videos', count: deletedContent.filter(item => item.contentType === 'video').length },
    { id: 'post', label: 'Posts', count: deletedContent.filter(item => item.contentType === 'post').length },
    { id: 'comment', label: 'Comments', count: deletedContent.filter(item => item.contentType === 'comment').length },
    { id: 'playlist', label: 'Playlists', count: deletedContent.filter(item => item.contentType === 'playlist').length }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading deleted content...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <PageMeta 
        title="Recently Deleted" 
        description="View and restore your recently deleted content" 
      />
      
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => navigate('/profile')}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">Recently Deleted</h1>
          <p className="text-gray-400">
            Items in Recently Deleted are automatically removed after 30 days. 
            You can restore or permanently delete them before then.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Bulk Actions */}
        {deletedContent.length > 0 && (
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-800 rounded-lg">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-gray-300 hover:text-white"
            >
              {selectedItems.size === deletedContent.length ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              Select All
            </button>
            
            {selectedItems.size > 0 && (
              <Button
                onClick={handleBulkRestore}
                disabled={bulkRestoring}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {bulkRestoring ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restore Selected ({selectedItems.size})
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Content List */}
        <div className="space-y-4">
          {deletedContent.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="py-12 text-center">
                <Trash2 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No deleted content</h3>
                <p className="text-gray-400">
                  Items you delete will appear here and can be restored for 30 days.
                </p>
              </CardContent>
            </Card>
          ) : (
            deletedContent.map((item) => {
              const itemKey = `${item.contentType}-${item._id}`;
              const isSelected = selectedItems.has(itemKey);
              const isRestoring = restoring.has(itemKey);
              const isPermanentDeleting = permanentDeleting.has(itemKey);
              const ContentIcon = getContentIcon(item.contentType);
              
              return (
                <Card 
                  key={itemKey}
                  className={`bg-gray-800 border-gray-700 transition-all ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Selection Checkbox */}
                      <button
                        onClick={() => toggleItemSelection(item)}
                        className="mt-1 text-gray-400 hover:text-white"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>

                      {/* Content Icon */}
                      <div className="p-3 bg-gray-700 rounded-lg">
                        <ContentIcon className="w-6 h-6 text-gray-300" />
                      </div>
                      
                      {/* Content Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-white font-medium truncate">
                              {getContentTitle(item)}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`text-xs ${getContentTypeColor(item.contentType)}`}>
                                {item.contentType}
                              </Badge>
                              {item.isExpiringSoon && (
                                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Expiring Soon
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Deleted {formatDistanceToNow(new Date(item.deletedAt))} ago</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {item.canRestore ? (
                                `${item.daysRemaining} days remaining`
                              ) : (
                                'Recovery period expired'
                              )}
                            </span>
                          </div>
                          {item.deleteReason && (
                            <div className="text-gray-500">
                              Reason: {item.deleteReason}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {item.canRestore && (
                          <Button
                            onClick={() => handleRestore(item)}
                            disabled={isRestoring}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
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
                          onClick={() => handlePermanentDelete(item)}
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
            })
          )}
        </div>
      </div>
    </div>
  );
}