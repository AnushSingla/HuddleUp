import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X } from 'lucide-react';
import { shareToTwitter, shareToFacebook, shareToWhatsApp, shareToLinkedIn, shareViaEmail, copyLinkToClipboard } from '@/utils/share';
import { toast } from 'sonner';

const ShareMenu = ({ url, title, description = '', onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  const shareOptions = [
    {
      id: 'twitter',
      label: 'Twitter',
      icon: '𝕏',
      color: '#000000',
      hoverColor: '#1DA1F2',
      action: () => {
        shareToTwitter(url, title, description);
        toast.success('Opening Twitter...');
        setIsOpen(false);
      }
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: 'f',
      color: '#1877F2',
      hoverColor: '#0A66C2',
      action: () => {
        shareToFacebook(url);
        toast.success('Opening Facebook...');
        setIsOpen(false);
      }
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: '💬',
      color: '#25D366',
      hoverColor: '#20BA5F',
      action: () => {
        shareToWhatsApp(url, title);
        toast.success('Opening WhatsApp...');
        setIsOpen(false);
      }
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: 'in',
      color: '#0A66C2',
      hoverColor: '#004182',
      action: () => {
        shareToLinkedIn(url, title);
        toast.success('Opening LinkedIn...');
        setIsOpen(false);
      }
    },
    {
      id: 'email',
      label: 'Email',
      icon: '✉️',
      color: '#EA4335',
      hoverColor: '#C5221F',
      action: () => {
        shareViaEmail(url, title, description);
        setIsOpen(false);
      }
    },
    {
      id: 'copy',
      label: 'Copy Link',
      icon: '🔗',
      color: 'var(--accent)',
      hoverColor: 'var(--accent)',
      action: () => {
        copyLinkToClipboard(
          url,
          (msg) => {
            toast.success(msg);
            setIsOpen(false);
          },
          (msg) => toast.error(msg)
        );
      }
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg transition-all"
        style={{
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-sub)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.color = 'var(--accent)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.color = 'var(--text-sub)';
        }}
        title="Share video"
      >
        <Share2 className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Share Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 z-50 rounded-xl shadow-2xl overflow-hidden"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                minWidth: '200px'
              }}
            >
              {/* Header */}
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{
                  background: 'var(--bg-primary)',
                  borderBottom: '1px solid var(--border-subtle)'
                }}
              >
                <span className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                  Share Video
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded transition-all"
                  style={{ color: 'var(--text-sub)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Share Options */}
              <div className="py-2">
                {shareOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    onClick={option.action}
                    whileHover={{ x: 4 }}
                    className="w-full px-4 py-3 flex items-center gap-3 transition-all text-sm font-medium"
                    style={{ color: 'var(--text-main)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: option.color }}
                    >
                      {option.icon}
                    </div>
                    <span>{option.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShareMenu;
