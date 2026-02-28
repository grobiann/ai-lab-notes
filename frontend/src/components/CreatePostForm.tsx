import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Post, CreatePostRequest } from '../types/api';

interface CreatePostFormProps {
  postId?: number;
  onSuccess?: (post: Post) => void;
  onError?: (error: Error) => void;
}

/**
 * Form for creating and editing blog posts
 */
export const CreatePostForm: React.FC<CreatePostFormProps> = ({ postId, onSuccess, onError }) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await api.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    loadCategories();
  }, []);

  // Load existing post for editing
  useEffect(() => {
    if (postId) {
      const loadPost = async () => {
        setLoading(true);
        try {
          const post = await api.getPost(postId);
          setTitle(post.title);
          setSlug(post.slug);
          setContent(post.content);
          setExcerpt(post.excerpt || '');
          setDescription(post.description || '');
          setCategory(post.category || '');
          setIsPublished(post.isPublished);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load post');
        } finally {
          setLoading(false);
        }
      };

      loadPost();
    }
  }, [postId]);

  // Auto-generate slug from title
  const generateSlug = (titleText: string) => {
    const generated = titleText
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    setSlug(generated);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    if (!slug || slug === '') {
      generateSlug(newTitle);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !content) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);

    try {
      const postData: CreatePostRequest = {
        title,
        content,
        slug: slug || undefined,
        excerpt: excerpt || undefined,
        description: description || undefined,
        category: category || undefined,
        isPublished,
      };

      let post: Post;

      if (postId) {
        post = await api.updatePost(postId, postData);
      } else {
        post = await api.createPost(postData);
      }

      onSuccess?.(post);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save post';
      setError(errorMsg);
      onError?.(err instanceof Error ? err : new Error(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="create-post-form" onSubmit={handleSubmit}>
      <h2>{postId ? 'Edit Post' : 'Create New Post'}</h2>

      {error && <div className="error">{error}</div>}

      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Post title"
          disabled={loading}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="slug">Slug</label>
        <input
          id="slug"
          type="text"
          value={slug}
          onChange={e => setSlug(e.target.value)}
          placeholder="URL slug (auto-generated)"
          disabled={loading}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={e => setCategory(e.target.value)} disabled={loading}>
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group checkbox">
          <label htmlFor="isPublished">
            <input
              id="isPublished"
              type="checkbox"
              checked={isPublished}
              onChange={e => setIsPublished(e.target.checked)}
              disabled={loading}
            />
            Publish Immediately
          </label>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Brief description for preview"
          disabled={loading}
          maxLength={500}
        />
        <small>{description.length}/500</small>
      </div>

      <div className="form-group">
        <label htmlFor="excerpt">Excerpt</label>
        <textarea
          id="excerpt"
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          placeholder="Short excerpt (auto-generated if empty)"
          disabled={loading}
          rows={3}
          maxLength={500}
        />
        <small>{excerpt.length}/500</small>
      </div>

      <div className="form-group">
        <label htmlFor="content">Content *</label>
        <textarea
          id="content"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write your post content here (Markdown supported)"
          disabled={loading}
          required
          rows={15}
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Saving...' : postId ? 'Update Post' : 'Create Post'}
        </button>
        <a href="/admin" className="btn btn-secondary">
          Cancel
        </a>
      </div>
    </form>
  );
};
