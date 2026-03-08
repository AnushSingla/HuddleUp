import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, User, X, Upload, Eye } from 'lucide-react';

const DuplicateDetectionModal = ({ 
  isOpen, 
  onClose, 
  duplicateInfo, 
  onProceed, 
  onCancel 
}) => {
  if (!isOpen || !duplicateInfo) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown duration';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.8)' }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
                  {duplicateInfo.type === 'exact' ? 'Duplicate Video Detected' : 'Similar Videos Found'}
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-sub)' }}>
                  {duplicateInfo.message}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5" style={{ color: 'var(--text-sub)' }} />
            </button>
          </div>

          {/* Exact Duplicate */}
          {duplicateInfo.type === 'exact' && duplicateInfo.originalVideo && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>
                Original Video
              </h3>
              <div 
                className="p-4 rounded-lg border"
                style={{ 
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--text-main)' }}>
                      {duplicateInfo.originalVideo.title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-sub)' }}>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{duplicateInfo.originalVideo.uploadedBy}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(duplicateInfo.originalVideo.uploadDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--clay-red)' }}>
                  This exact video has already been uploaded. Duplicate uploads are not allowed to maintain platform quality and reduce storage costs.
                </p>
              </div>
            </div>
          )}

          {/* Potential Duplicates */}
          {duplicateInfo.type === 'potential' && duplicateInfo.potentialDuplicates && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>
                Similar Videos ({duplicateInfo.potentialDuplicates.length})
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {duplicateInfo.potentialDuplicates.map((video, index) => (
                  <div 
                    key={video.id}
                    className="p-4 rounded-lg border"
                    style={{ 
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2" style={{ color: 'var(--text-main)' }}>
                          {video.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-sub)' }}>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{video.uploadedBy}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(video.uploadDate)}</span>
                          </div>
                          {video.duration && (
                            <span>{formatDuration(video.duration)}</span>
                          )}
                          {video.fileSize && (
                            <span>{formatFileSize(video.fileSize)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 rounded-lg" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                  We found videos with similar characteristics. Please review them to ensure you're not uploading duplicate content.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {duplicateInfo.type === 'exact' ? (
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all"
                style={{
                  background: 'var(--accent)',
                  color: 'white'
                }}
              >
                <X className="w-4 h-4 inline mr-2" />
                Cancel Upload
              </button>
            ) : (
              <>
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)'
                  }}
                >
                  <X className="w-4 h-4 inline mr-2" />
                  Cancel
                </button>
                <button
                  onClick={onProceed}
                  className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white'
                  }}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload Anyway
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DuplicateDetectionModal;