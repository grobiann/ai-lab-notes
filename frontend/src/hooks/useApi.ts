import { useState, useCallback } from 'react';
import { api } from '../services/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Generic hook for API calls
 */
export function useApi<T>(
  fn: () => Promise<T>,
  autoFetch: boolean = false
): UseApiState<T> & {
  fetch: () => Promise<T | null>;
  refetch: () => Promise<T | null>;
} {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: autoFetch,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await fn();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState({ data: null, loading: false, error: err });
      return null;
    }
  }, [fn]);

  const refetch = useCallback(() => fetch(), [fetch]);

  // Auto-fetch on mount if enabled
  React.useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [fetch, autoFetch]);

  return { ...state, fetch, refetch };
}

/**
 * Hook for auth operations
 */
export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.login(username, password);
      setUser(response.user);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.register(username, email, password);
      setUser(response.user);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await api.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCurrentUser = useCallback(async () => {
    setLoading(true);
    try {
      const user = await api.getCurrentUser();
      setUser(user);
      return user;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    getCurrentUser,
    isAuthenticated: api.isAuthenticated(),
  };
}

/**
 * Hook for posts
 */
export function usePosts(page: number = 1, limit: number = 10) {
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getPosts(page, limit);
      setPosts(response.posts);
      setTotal(response.total);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  React.useEffect(() => {
    fetch();
  }, [fetch]);

  return { posts, total, loading, error, fetch };
}

/**
 * Hook for single post
 */
export function usePost(id: number) {
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const post = await api.getPost(id);
      setPost(post);
      return post;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetch();
  }, [fetch]);

  return { post, loading, error, fetch };
}

/**
 * Hook for comments
 */
export function useComments(postId: number, includeReplies: boolean = true) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const comments = await api.getComments(postId, includeReplies);
      setComments(comments);
      return comments;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [postId, includeReplies]);

  const createComment = useCallback(
    async (content: string, parentCommentId?: number) => {
      try {
        const comment = await api.createComment({
          content,
          postId,
          parentCommentId,
        });
        await fetch();
        return comment;
      } catch (err) {
        throw err instanceof Error ? err : new Error(String(err));
      }
    },
    [postId, fetch]
  );

  React.useEffect(() => {
    fetch();
  }, [fetch]);

  return { comments, loading, error, createComment, refetch: fetch };
}

import React from 'react';
