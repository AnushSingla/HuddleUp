import React, { useState, useEffect } from 'react';
import { API } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  User,
  Search,
  Filter,
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

export default function AdminDeletedContent() {
  const [deletedContent, setDeletedContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(new Set());
  const [permanentDeleting, setPermanentDeleting] = useState(new Set());
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [bulkRestoring, setBulkRestoring] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    sortBy: 'deletedAt',
    sortOrder: -1,
    dateFrom: '',
    dateTo: '',
    deletedBy: ''
  });

  useEffect(() => {
    loadDeletedContent();
  }, [activeTab, filters]);

  const loadDeletedContent = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: activeTab,
        ...filters
      });
      
      const response = await API.get(`/admin/deleted?${params}`);
      setDeletedContent(response.data.data);
      setSelectedItems(new Set()); // Clear selections when data changes
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
      await API.post(`/admin/restore/${type}/${id}`);
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
      await API.delete(`/admin/permanent/${type}/${id}`);
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

  const handleBulkRestore = async () => {
    if (selectedItems.size === 0) {
      toast.error('No items selected');
      return;
    }

    setBulkRestoring(true);
    
    try {
      const items = Array.from(selectedItems).map(item => {
        const [type, id] = item.split('-');
        return { type, id };
      });

      const response = await API.post('/admin/bulk-restore', { items });
      const { results } = response.data;
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      if (successCount > 0) {
        toast.success(`${successCount} items restored successfully`);
      }
      if (failureCount > 0) {
        toast.error(`${failureCount} items failed to restore`);
      }
      
      loadDeletedContent();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Bulk restore failed';
      toast.error(errorMsg);
    } finally {
      setBulkRestoring(false);
    }
  };

  const handleCleanup = async () => {
    const retentionDays = prompt('Enter retention period in days (content older than this will be permanently deleted):', '30');
    
    if (!retentionDays || isNaN(retentionDays)) {
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete all content older than ${retentionDays} days? This action cannot be undone.`)) {
      return;
    }

    setCleaning(true);
    
    try {
      const response = await API.post('/admin/cleanup', { 
        retentionDays: parseInt(retentionDays) 
      });
      
      toast.success(response.data.message);
      loadDeletedContent();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Cleanup failed';
      toast.error(errorMsg);
    } finally {
      setCleaning(false);
    }
  };

  const toggleItemSelection = (type, id) => {
    const itemKey = `${type}-${id}`;
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
    const allItems = getAllItems();
    if (selectedItems.size === allItems.length) {
      setSelectedItems(new Set());
    } else {
      const allItemKeys = allItems.map(item => `${item.type}-${item._id}`);
      setSelectedItems(new Set(allItemKeys));
    }
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

  const renderContentItem = (item, type) => {
    const Icon = getContentIcon(type);
    const isSelected = selectedItems.has(`${type}-${item._id}`);
    const isRestoring = restoring.has(`${type}-${item._id}`);
    const isPermanentDeleting = permanentDeleting.has(`${type}-${item._id}`);

    return (
      <Card key={item._id} className={`bg-gray-800 border-gray-700 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleItemSelection(type, item._id)}
                  className="text-gray-400 hover:text-white"
                >
                  {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                </button>
                <div className="p-3 bg-gray-700 rounded-lg">
                  <Icon className="w-6 h-6 text-gray-300" />
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-white font-medium">
                    {item.title || item.text || item.name || 'Untitled'}
                  </h3>
                  <Badge className={getContentTypeColor(type)}>
                    {type}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Deleted {formatDistanceToNow(new Date(item.deletedAt))} ago</span>
                  </div>
                  {item.deletedBy && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>By: {item.deletedBy.username || item.deletedBy.email}</span>
                    </div>
                  )}
                  {item.deleteReason && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Reason: {item.deleteReason}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white">Loading deleted content...</div>
      </div>
    );
  }

  const totalCount = getTotalCount();
  const allItems = getAllItems();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Deleted Content Management</h2>
        
        <div className="flex items-center gap-2">
          {selectedItems.size > 0 && (
            <Button
              onClick={handleBulkRestore}
              disabled={bulkRestoring}
              className="bg-green-600 hover:bg-green-700"
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
          
          <Button
            onClick={handleCleanup}
            disabled={cleaning}
            variant="destructive"
          >
            {cleaning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Cleaning...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Cleanup Old Content
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Filters:</span>
            </div>
            
            <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
              <SelectTrigger className="w-40 bg-gray-700 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deletedAt">Deleted Date</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Deleted by user..."
              value={filters.deletedBy}
              onChange={(e) => setFilters(prev => ({ ...prev, deletedBy: e.target.value }))}
              className="w-48 bg-gray-700 border-gray-600"
            />

            <Input
              type="date"
              placeholder="From date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-40 bg-gray-700 border-gray-600"
            />

            <Input
              type="date"
              placeholder="To date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-40 bg-gray-700 border-gray-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
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

      {/* Select All */}
      {totalCount > 0 && (
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            {selectedItems.size === allItems.length ? 
              <CheckSquare className="w-5 h-5" /> : 
              <Square className="w-5 h-5" />
            }
            <span className="text-sm">
              {selectedItems.size === allItems.length ? 'Deselect All' : 'Select All'}
            </span>
          </button>
          {selectedItems.size > 0 && (
            <span className="text-sm text-gray-400">
              ({selectedItems.size} selected)
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {totalCount === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="py-12 text-center">
              <Trash2 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">No deleted content</h3>
              <p className="text-gray-400">No deleted content found matching the current filters.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {activeTab === 'all' ? (
              allItems.map(item => renderContentItem(item, item.type))
            ) : (
              deletedContent[activeTab]?.documents?.map(item => 
                renderContentItem(item, activeTab.slice(0, -1)) // Remove 's' from plural
              ) || []
            )}
          </>
        )}
      </div>
    </div>
  );
}