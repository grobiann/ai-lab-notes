/**
 * API Response and Data Types
 */

// Authentication
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Posts
export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  description?: string;
  excerpt?: string;
  category?: string;
  author: User;
  authorId: number;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  lastViewedAt?: string;
  publishedAt?: string;
  tags: Tag[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface PostListResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  description?: string;
  excerpt?: string;
  category?: string;
  slug?: string;
  isPublished?: boolean;
}

// Comments
export interface Comment {
  id: number;
  content: string;
  postId: number;
  userId: number;
  user: User;
  parentCommentId?: number;
  replies?: Comment[];
  isApproved: boolean;
  isSpam: boolean;
  moderationNote?: string;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  postId: number;
  parentCommentId?: number;
}

// Tags
export interface Tag {
  id: number;
  name: string;
  createdAt: string;
}

// API Error
export interface ApiError {
  error: string;
  status?: number;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Search
export interface SearchParams extends PaginationParams {
  q?: string;
  tags?: string[];
  category?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'featured';
  featured?: boolean;
}
