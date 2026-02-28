import React from 'react';
import { usePost, useComments, useAuth } from '../hooks/useApi';
import { CommentSection } from './CommentSection';

interface PostDetailProps {
  postId: number;
}

/**
 * Displays a single blog post with full content and comments
 */
export const PostDetail: React.FC<PostDetailProps> = ({ postId }) => {
  const { post, loading: postLoading, error: postError } = usePost(postId);
  const { comments, loading: commentsLoading, createComment } = useComments(postId);
  const { user } = useAuth();

  if (postLoading) {
    return <div className="loading">Loading post...</div>;
  }

  if (postError || !post) {
    return <div className="error">Error loading post: {postError?.message}</div>;
  }

  return (
    <article className="post-detail">
      <header className="post-header">
        <h1>{post.title}</h1>

        <div className="meta">
          <span className="author">By {post.author.username}</span>
          <time>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</time>
          {post.category && <span className="category">{post.category}</span>}
          <span className="views">{post.viewCount} views</span>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="tags">
            {post.tags.map(tag => (
              <a key={tag.id} href={`/posts/search?tags=${tag.name}`} className="tag">
                #{tag.name}
              </a>
            ))}
          </div>
        )}
      </header>

      <div className="post-content">
        {/* Render Markdown content - use a markdown renderer like react-markdown */}
        <div
          dangerouslySetInnerHTML={{
            __html: post.content, // In production, use a proper markdown parser
          }}
        />
      </div>

      <section className="comments-section">
        <h2>Comments ({comments.length})</h2>

        {user ? (
          <CommentSection
            postId={postId}
            comments={comments}
            onCommentCreate={createComment}
            currentUser={user}
          />
        ) : (
          <div className="auth-required">
            <p>Please log in to post a comment</p>
            <a href="/login" className="btn btn-primary">
              Log In
            </a>
          </div>
        )}

        {commentsLoading && <div className="loading">Loading comments...</div>}
      </section>
    </article>
  );
};
