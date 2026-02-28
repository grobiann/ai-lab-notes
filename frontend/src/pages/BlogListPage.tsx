import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PostList } from '../components/PostList';
import { SearchFilters } from '../components/SearchFilters';
import { api } from '../services/api';
import { SearchParams, PostListResponse } from '../types/api';

/**
 * Blog list page with filtering and pagination
 */
export const BlogListPage: React.FC = () => {
  const [posts, setPosts] = useState<PostListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentParams, setCurrentParams] = useState<SearchParams>({ page: 1, limit: 10 });

  const loadPosts = async (params: SearchParams) => {
    setLoading(true);
    setError(null);

    try {
      if (params.q || params.category || params.sortBy !== 'newest' || params.featured) {
        const result = await api.searchPosts(params);
        setPosts(result);
      } else {
        const result = await api.getPosts(params.page || 1, params.limit || 10);
        setPosts(result);
      }
      setCurrentParams(params);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  // Load initial posts
  useEffect(() => {
    loadPosts(currentParams);
  }, []);

  const handleSearch = (params: SearchParams) => {
    loadPosts(params);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = { ...currentParams, page: newPage };
    loadPosts(newParams);
  };

  return (
    <div className="blog-list-page">
      <div className="page-container">
        <h1>Blog</h1>
        <p className="page-subtitle">Articles on AI, ML, and software engineering</p>

        <SearchFilters onSearch={handleSearch} loading={loading} />

        {error && <div className="error">{error}</div>}

        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : !posts || posts.posts.length === 0 ? (
          <div className="empty">
            <p>No posts found. Check back soon!</p>
            <Link to="/" className="btn btn-primary">
              Go Home
            </Link>
          </div>
        ) : (
          <>
            <div className="posts-container">
              <PostList
                posts={posts.posts}
                onPostSelect={post => {
                  window.location.href = `/blog/${post.slug}`;
                }}
              />
            </div>

            {posts.totalPages > 1 && (
              <nav className="pagination">
                <button
                  disabled={currentParams.page === 1 || loading}
                  onClick={() => handlePageChange((currentParams.page || 1) - 1)}
                  className="btn btn-secondary"
                >
                  ← Previous
                </button>

                <div className="page-info">
                  Page {currentParams.page || 1} of {posts.totalPages}
                </div>

                <button
                  disabled={currentParams.page === posts.totalPages || loading}
                  onClick={() => handlePageChange((currentParams.page || 1) + 1)}
                  className="btn btn-secondary"
                >
                  Next →
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
};
