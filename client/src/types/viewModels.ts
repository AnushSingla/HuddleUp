/**
 * ═══════════════════════════════════════════════════
 * VIEW MODELS - Data contract between backend and UI
 * ═══════════════════════════════════════════════════
 * 
 * These ViewModels create a stable interface layer that:
 * - Protects UI from backend changes
 * - Allows safe UI redesigns without breaking logic
 * - Provides clear data contracts
 * - Enables easy mapping/transformation
 */

// ═══════════════════════════════════════════════════
// VIDEO VIEW MODELS
// ═══════════════════════════════════════════════════

export type VideoCardVM = {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl?: string;
  category: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  stats: {
    views?: number;
    likes?: number;
    comments?: number;
  };
  duration?: string;
};

export type VideoDetailVM = VideoCardVM & {
  description: string;
  tags?: string[];
  isLiked?: boolean;
  isSaved?: boolean;
};

// ═══════════════════════════════════════════════════
// POST VIEW MODELS
// ═══════════════════════════════════════════════════

export type PostCardVM = {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  createdAt: string;
  category?: string;
  stats: {
    likes: number;
    comments: number;
    shares?: number;
  };
  isLiked?: boolean;
  isPinned?: boolean;
  attachments?: {
    type: 'image' | 'video' | 'link';
    url: string;
    thumbnail?: string;
  }[];
};

export type PostThreadVM = PostCardVM & {
  comments: CommentVM[];
  depth?: number;
};

// ═══════════════════════════════════════════════════
// COMMENT VIEW MODELS
// ═══════════════════════════════════════════════════

export type CommentVM = {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  stats: {
    likes: number;
    replies?: number;
  };
  isLiked?: boolean;
  parentId?: string;
  depth?: number;
};

// ═══════════════════════════════════════════════════
// USER VIEW MODELS
// ═══════════════════════════════════════════════════

export type UserProfileVM = {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  bio?: string;
  stats: {
    followers?: number;
    following?: number;
    posts?: number;
    videos?: number;
  };
  isFollowing?: boolean;
  isFriend?: boolean;
};

export type UserCardVM = {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  status?: 'online' | 'offline' | 'away';
};

// ═══════════════════════════════════════════════════
// CATEGORY VIEW MODELS
// ═══════════════════════════════════════════════════

export type CategoryVM = {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  count?: number;
};

// ═══════════════════════════════════════════════════
// MAPPER UTILITIES
// ═══════════════════════════════════════════════════

/**
 * Helper function to map backend video data to VideoCardVM
 * Usage: const video = mapVideoToVM(apiResponse)
 */
export function mapVideoToVM(apiVideo: any): VideoCardVM {
  return {
    id: apiVideo._id || apiVideo.id,
    title: apiVideo.title || 'Untitled Video',
    thumbnail: apiVideo.thumbnail || '/placeholder-video.jpg',
    videoUrl: apiVideo.videoUrl || apiVideo.url,
    category: apiVideo.category || 'General',
    createdAt: apiVideo.createdAt || new Date().toISOString(),
    author: {
      id: apiVideo.user?._id || apiVideo.userId || 'unknown',
      name: apiVideo.user?.name || apiVideo.userName || 'Anonymous',
      avatar: apiVideo.user?.avatar || apiVideo.userAvatar,
    },
    stats: {
      views: apiVideo.views || 0,
      likes: apiVideo.likes?.length || apiVideo.likesCount || 0,
      comments: apiVideo.comments?.length || apiVideo.commentsCount || 0,
    },
    duration: apiVideo.duration,
  };
}

/**
 * Helper function to map backend post data to PostCardVM
 * Usage: const post = mapPostToVM(apiResponse)
 */
export function mapPostToVM(apiPost: any): PostCardVM {
  return {
    id: apiPost._id || apiPost.id,
    content: apiPost.content || apiPost.text || '',
    author: {
      id: apiPost.user?._id || apiPost.userId || 'unknown',
      name: apiPost.user?.name || apiPost.userName || 'Anonymous',
      avatar: apiPost.user?.avatar || apiPost.userAvatar,
      role: apiPost.user?.role,
    },
    createdAt: apiPost.createdAt || new Date().toISOString(),
    category: apiPost.category,
    stats: {
      likes: apiPost.likes?.length || apiPost.likesCount || 0,
      comments: apiPost.comments?.length || apiPost.commentsCount || 0,
      shares: apiPost.shares || 0,
    },
    isLiked: apiPost.isLiked || false,
    isPinned: apiPost.isPinned || false,
  };
}

/**
 * Helper function to map backend comment data to CommentVM
 * Usage: const comment = mapCommentToVM(apiResponse)
 */
export function mapCommentToVM(apiComment: any): CommentVM {
  return {
    id: apiComment._id || apiComment.id,
    content: apiComment.content || apiComment.text || '',
    author: {
      id: apiComment.user?._id || apiComment.userId || 'unknown',
      name: apiComment.user?.name || apiComment.userName || 'Anonymous',
      avatar: apiComment.user?.avatar || apiComment.userAvatar,
    },
    createdAt: apiComment.createdAt || new Date().toISOString(),
    stats: {
      likes: apiComment.likes?.length || apiComment.likesCount || 0,
      replies: apiComment.replies?.length || 0,
    },
    isLiked: apiComment.isLiked || false,
    parentId: apiComment.parentId,
  };
}

/**
 * Helper function to map backend user data to UserProfileVM
 * Usage: const user = mapUserToVM(apiResponse)
 */
export function mapUserToVM(apiUser: any): UserProfileVM {
  return {
    id: apiUser._id || apiUser.id,
    name: apiUser.name || 'Anonymous',
    username: apiUser.username,
    avatar: apiUser.avatar,
    bio: apiUser.bio,
    stats: {
      followers: apiUser.followers?.length || 0,
      following: apiUser.following?.length || 0,
      posts: apiUser.posts?.length || 0,
      videos: apiUser.videos?.length || 0,
    },
    isFollowing: apiUser.isFollowing || false,
    isFriend: apiUser.isFriend || false,
  };
}
