import {
  User,
  Post,
  PostListResponse,
  CreatePostRequest,
  Comment,
  CreateCommentRequest,
  LoginResponse,
  SearchParams,
} from '../types/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.loadTokens();
  }

  private loadTokens(): void {
    const tokens = localStorage.getItem('tokens');
    if (tokens) {
      try {
        const parsed = JSON.parse(tokens);
        this.accessToken = parsed.accessToken;
        this.refreshToken = parsed.refreshToken;
      } catch (error) {
        localStorage.removeItem('tokens');
      }
    }
  }

  private saveTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('tokens', JSON.stringify({ accessToken, refreshToken }));
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('tokens');
  }

  private getHeaders(includeAuth: boolean = true): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { requiresAuth?: boolean } = {}
  ): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options;

    const url = `${API_BASE_URL}${endpoint}`;

    try {
      let response = await fetch(url, {
        ...fetchOptions,
        headers: this.getHeaders(requiresAuth),
      });

      // Handle token expiration
      if (response.status === 401 && this.refreshToken && requiresAuth) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          response = await fetch(url, {
            ...fetchOptions,
            headers: this.getHeaders(true),
          });
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Authentication
  async register(username: string, email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
      requiresAuth: false,
    });

    this.saveTokens(response.accessToken, response.refreshToken);
    return response;
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      requiresAuth: false,
    });

    this.saveTokens(response.accessToken, response.refreshToken);
    return response;
  }

  async logout(): Promise<void> {
    if (this.refreshToken) {
      try {
        await this.request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    this.clearTokens();
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      this.clearTokens();
      return false;
    }

    try {
      const response = await this.request<{ accessToken: string; refreshToken: string }>(
        '/auth/refresh',
        {
          method: 'POST',
          body: JSON.stringify({ refreshToken: this.refreshToken }),
          requiresAuth: false,
        }
      );

      this.saveTokens(response.accessToken, response.refreshToken);
      return true;
    } catch (error) {
      this.clearTokens();
      return false;
    }
  }

  // Posts
  async getPosts(page: number = 1, limit: number = 10): Promise<PostListResponse> {
    return this.request<PostListResponse>(`/posts?page=${page}&limit=${limit}`, {
      requiresAuth: false,
    });
  }

  async getPost(id: number): Promise<Post> {
    return this.request<Post>(`/posts/${id}`, {
      requiresAuth: false,
    });
  }

  async getPostBySlug(slug: string): Promise<Post> {
    return this.request<Post>(`/posts/slug/${slug}`, {
      requiresAuth: false,
    });
  }

  async searchPosts(params: SearchParams): Promise<PostListResponse> {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.category) query.append('category', params.category);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.tags?.length) query.append('tags', params.tags.join(','));
    if (params.featured) query.append('featured', 'true');

    return this.request<PostListResponse>(`/posts/search?${query.toString()}`, {
      requiresAuth: false,
    });
  }

  async getFeaturedPosts(limit: number = 5): Promise<Post[]> {
    return this.request<Post[]>(`/posts/featured?limit=${limit}`, {
      requiresAuth: false,
    });
  }

  async getRelatedPosts(postId: number, limit: number = 5): Promise<Post[]> {
    return this.request<Post[]>(`/posts/${postId}/related?limit=${limit}`, {
      requiresAuth: false,
    });
  }

  async getCategories(): Promise<string[]> {
    return this.request<string[]>('/posts/categories', {
      requiresAuth: false,
    });
  }

  async createPost(data: CreatePostRequest): Promise<Post> {
    return this.request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePost(id: number, data: Partial<CreatePostRequest>): Promise<Post> {
    return this.request<Post>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async publishPost(id: number): Promise<Post> {
    return this.request<Post>(`/posts/${id}/publish`, {
      method: 'PATCH',
    });
  }

  async unpublishPost(id: number): Promise<Post> {
    return this.request<Post>(`/posts/${id}/unpublish`, {
      method: 'PATCH',
    });
  }

  async featurePost(id: number): Promise<Post> {
    return this.request<Post>(`/posts/${id}/feature`, {
      method: 'PATCH',
    });
  }

  async deletePost(id: number): Promise<void> {
    return this.request(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  // Comments
  async getComments(postId: number, includeReplies: boolean = true): Promise<Comment[]> {
    const url = `/comments/post/${postId}?replies=${includeReplies}`;
    return this.request<Comment[]>(url, {
      requiresAuth: false,
    });
  }

  async createComment(data: CreateCommentRequest): Promise<Comment> {
    return this.request<Comment>('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateComment(id: number, content: string): Promise<Comment> {
    return this.request<Comment>(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async deleteComment(id: number): Promise<void> {
    return this.request(`/comments/${id}`, {
      method: 'DELETE',
    });
  }

  async likeComment(id: number): Promise<{ likeCount: number }> {
    return this.request<{ likeCount: number }>(`/comments/${id}/like`, {
      method: 'POST',
    });
  }

  async unlikeComment(id: number): Promise<{ likeCount: number }> {
    return this.request<{ likeCount: number }>(`/comments/${id}/like`, {
      method: 'DELETE',
    });
  }

  async getCommentLikeStatus(id: number): Promise<{ userHasLiked: boolean; likeCount: number }> {
    return this.request(`/comments/${id}/like-status`, {
      method: 'GET',
    });
  }

  // Moderation (Admin only)
  async approveComment(id: number, note?: string): Promise<Comment> {
    return this.request<Comment>(`/comments/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    });
  }

  async rejectComment(id: number, reason: string): Promise<Comment> {
    return this.request<Comment>(`/comments/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  async markCommentAsSpam(id: number): Promise<Comment> {
    return this.request<Comment>(`/comments/${id}/spam`, {
      method: 'PATCH',
    });
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}

export const api = new ApiClient();
