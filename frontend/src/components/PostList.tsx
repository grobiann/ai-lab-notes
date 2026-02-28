import React from 'react';
import { Post } from '../types/api';

interface PostListProps {
  posts: Post[];
  onPostSelect?: (post: Post) => void;
}

/**
 * Displays a list of blog posts
 */
export const PostList: React.FC<PostListProps> = ({
  posts,
  onPostSelect,
}) => {
  if (posts.length === 0) {
    return <div className="empty">No posts found</div>;
  }

  return (
    <div className="post-list">
      <div className="posts">
        {posts.map(post => (
          <article
            key={post.id}
            className={`post-card ${post.isFeatured ? 'featured' : ''}`}
            onClick={() => onPostSelect?.(post)}
          >
            <header>
              <h2>{post.title}</h2>
              <time>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</time>
            </header>

            <p className="excerpt">{post.excerpt || post.description}</p>

            <footer>
              <span className="author">By {post.author.username}</span>
              {post.category && <span className="category">{post.category}</span>}
              <span className="views">{post.viewCount} views</span>
            </footer>

            {post.tags && post.tags.length > 0 && (
              <div className="tags">
                {post.tags.map(tag => (
                  <span key={tag.id} className="tag">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};
