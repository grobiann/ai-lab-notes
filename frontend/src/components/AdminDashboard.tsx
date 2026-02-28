import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Post, Comment } from '../types/api';

interface AdminDashboardProps {
  onPostCreate?: () => void;
}

/**
 * Admin dashboard for managing posts and moderating comments
 */
export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onPostCreate }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'settings'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load posts
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.getPosts(1, 100);
        setPosts(response.posts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'posts') {
      loadPosts();
    }
  }, [activeTab]);

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await api.deletePost(postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  const handlePublishPost = async (postId: number) => {
    try {
      const updated = await api.publishPost(postId);
      setPosts(posts.map(p => (p.id === postId ? updated : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish post');
    }
  };

  const handleUnpublishPost = async (postId: number) => {
    try {
      const updated = await api.unpublishPost(postId);
      setPosts(posts.map(p => (p.id === postId ? updated : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unpublish post');
    }
  };

  const handleFeaturePost = async (postId: number) => {
    try {
      const updated = await api.featurePost(postId);
      setPosts(posts.map(p => (p.id === postId ? updated : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to feature post');
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      {error && <div className="error">{error}</div>}

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts ({posts.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          Comments
        </button>
        <button
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'posts' && (
          <div className="posts-management">
            <div className="posts-header">
              <h2>Manage Posts</h2>
              <a href="/admin/posts/new" className="btn btn-primary">
                Create New Post
              </a>
            </div>

            {loading ? (
              <div className="loading">Loading posts...</div>
            ) : posts.length === 0 ? (
              <p>No posts found</p>
            ) : (
              <table className="posts-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(post => (
                    <tr key={post.id}>
                      <td>
                        <strong>{post.title}</strong>
                        <div className="post-slug">{post.slug}</div>
                      </td>
                      <td>
                        <span
                          className={`status ${post.isPublished ? 'published' : 'draft'}`}
                        >
                          {post.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td>{post.viewCount}</td>
                      <td>{post.isFeatured ? '⭐ Yes' : 'No'}</td>
                      <td className="actions">
                        <a href={`/admin/posts/${post.id}/edit`} className="btn btn-sm">
                          Edit
                        </a>
                        {!post.isPublished ? (
                          <button
                            onClick={() => handlePublishPost(post.id)}
                            className="btn btn-sm btn-success"
                          >
                            Publish
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnpublishPost(post.id)}
                            className="btn btn-sm btn-warning"
                          >
                            Unpublish
                          </button>
                        )}
                        {!post.isFeatured ? (
                          <button
                            onClick={() => handleFeaturePost(post.id)}
                            className="btn btn-sm"
                          >
                            Feature
                          </button>
                        ) : null}
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="btn btn-sm btn-danger"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="comments-management">
            <h2>Moderate Comments</h2>
            <p>Comment moderation coming soon...</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-management">
            <h2>Settings</h2>
            <p>Settings management coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};
