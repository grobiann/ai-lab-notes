import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Post } from '../types/api';

/**
 * Home page with featured posts and latest blog entries
 */
export const HomePage: React.FC = () => {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      setError(null);

      try {
        const [featured, latest] = await Promise.all([
          api.getFeaturedPosts(3),
          api.getPosts(1, 6),
        ]);

        setFeaturedPosts(featured);
        setLatestPosts(latest.posts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  if (loading) {
    return <div className="page-loading">Loading...</div>;
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>AI Lab Notes</h1>
          <p>
            Exploring AI, machine learning, and software engineering through experiments, notes, and
            projects.
          </p>
          <Link to="/blog" className="btn btn-primary btn-lg">
            Read the Blog
          </Link>
        </div>
      </section>

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <section className="featured-posts">
          <div className="section-container">
            <h2>Featured Posts</h2>
            <div className="posts-grid">
              {featuredPosts.map(post => (
                <article key={post.id} className="post-card featured">
                  <div className="post-header">
                    <h3>
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                  </div>
                  <p className="excerpt">{post.excerpt || post.description}</p>
                  <div className="post-meta">
                    <span className="author">{post.author.username}</span>
                    <span className="date">
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Posts Section */}
      <section className="latest-posts">
        <div className="section-container">
          <h2>Latest Posts</h2>
          <div className="posts-list">
            {latestPosts.map(post => (
              <article key={post.id} className="post-item">
                <div className="post-content">
                  <h3>
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p>{post.excerpt || post.description}</p>
                  <div className="post-meta">
                    <span className="author">{post.author.username}</span>
                    <span className="date">
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                    </span>
                    {post.category && <span className="category">{post.category}</span>}
                    <span className="views">👁️ {post.viewCount}</span>
                  </div>
                </div>
                <Link to={`/blog/${post.slug}`} className="btn btn-sm">
                  Read More →
                </Link>
              </article>
            ))}
          </div>

          {error && <div className="error">{error}</div>}

          <div className="section-footer">
            <Link to="/blog" className="btn btn-secondary">
              View All Posts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
