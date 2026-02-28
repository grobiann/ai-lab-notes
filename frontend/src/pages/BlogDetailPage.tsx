import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Post, Comment } from '../types/api';
import { CommentSection } from '../components/CommentSection';
import { useAuthContext } from '../context/AuthContext';

/**
 * Single blog post detail page with comments
 */
export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;

      setLoading(true);
      setError(null);

      try {
        const loadedPost = await api.getPostBySlug(slug);
        setPost(loadedPost);

        // Load comments
        const loadedComments = await api.getComments(loadedPost.id);
        setComments(loadedComments);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  const handleCommentCreate = async (content: string, parentId?: number) => {
    if (!post || !user) return;

    try {
      const newComment = await api.createComment({
        content,
        postId: post.id,
        parentCommentId: parentId,
      });

      // Reload comments
      const updatedComments = await api.getComments(post.id);
      setComments(updatedComments);

      return newComment;
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return <div className="page-loading">Loading post...</div>;
  }

  if (error || !post) {
    return (
      <div className="page-container">
        <div className="error">
          <h2>Error Loading Post</h2>
          <p>{error || 'Post not found'}</p>
          <Link to="/blog" className="btn btn-primary">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <article className="post-detail">
        <div className="post-header">
          <h1>{post.title}</h1>

          <div className="post-meta">
            <span className="author">By {post.author.username}</span>
            <time>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</time>
            {post.category && <span className="category">{post.category}</span>}
            <span className="views">👁️ {post.viewCount} views</span>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="tags">
              {post.tags.map(tag => (
                <Link key={tag.id} to={`/blog?tags=${tag.name}`} className="tag">
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="post-content">
          <div
            className="markdown-content"
            dangerouslySetInnerHTML={{
              __html: post.content,
            }}
          />
        </div>

        <div className="post-footer">
          <Link to="/blog" className="btn btn-secondary">
            ← Back to Blog
          </Link>
        </div>
      </article>

      <section className="comments-section">
        <h2>Comments ({comments.length})</h2>

        {user ? (
          <CommentSection
            postId={post.id}
            comments={comments}
            onCommentCreate={handleCommentCreate}
            currentUser={user}
          />
        ) : (
          <div className="auth-required">
            <p>Please log in to post a comment</p>
            <Link to="/login" className="btn btn-primary">
              Log In
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};
