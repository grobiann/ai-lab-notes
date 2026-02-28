import { Router } from 'express';
import { PostService, SearchParams } from '../services/PostService';
import { authMiddleware, optionalAuthMiddleware, adminMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const postService = new PostService();

// Search and filter posts
router.get('/search', optionalAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const query = req.query.q as string;
    const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
    const category = req.query.category as string;
    const sortBy = (req.query.sortBy as any) || 'newest';
    const featured = req.query.featured === 'true';

    const searchParams: SearchParams = {
      page,
      limit,
      query,
      tags,
      category,
      sortBy,
      featured,
    };

    const result = await postService.searchPosts(searchParams);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search posts' });
  }
});

// Get featured posts
router.get('/featured', optionalAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 5));
    const posts = await postService.getFeaturedPosts(limit);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch featured posts' });
  }
});

// Get categories
router.get('/categories', optionalAuthMiddleware, async (req, res) => {
  try {
    const categories = await postService.getCategories();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get posts by category
router.get('/category/:category', optionalAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const category = req.params.category;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));

    const result = await postService.getPostsByCategory(category, { page, limit });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts by category' });
  }
});

// Get related posts
router.get('/:id/related', optionalAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    const limit = Math.max(1, Math.min(20, parseInt(req.query.limit as string) || 5));
    const posts = await postService.getRelatedPosts(id, limit);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch related posts' });
  }
});

// Get all posts (with pagination)
router.get('/', optionalAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));

    const isAdmin = req.user?.role === 'admin';
    const result = isAdmin
      ? await postService.getAllPosts({ page, limit })
      : await postService.getPublishedPosts({ page, limit });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get post by ID
router.get('/:id', optionalAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    const post = await postService.getPostById(id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const isAdmin = req.user?.role === 'admin';
    if (!post.isPublished && !isAdmin) {
      res.status(403).json({ error: 'Post not found' });
      return;
    }

    // Record view for published posts
    if (post.isPublished) {
      await postService.recordView(id);
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Create new post
router.post('/', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, content, description, excerpt, category, isPublished, slug } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const post = await postService.createPost(
      title,
      content,
      req.user.userId,
      description,
      excerpt,
      category,
      isPublished || false,
      slug
    );

    res.status(201).json(post);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create post';
    res.status(400).json({ error: message });
  }
});

// Update post
router.put('/:id', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    const { title, content, description, excerpt, category, isPublished, slug } = req.body;
    const post = await postService.updatePost(id, {
      ...(title && { title }),
      ...(content && { content }),
      ...(description !== undefined && { description }),
      ...(excerpt !== undefined && { excerpt }),
      ...(category !== undefined && { category }),
      ...(slug && { slug }),
      ...(isPublished !== undefined && { isPublished }),
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update post' });
  }
});

// Publish post
router.patch('/:id/publish', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    const post = await postService.publishPost(id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ error: 'Failed to publish post' });
  }
});

// Unpublish post
router.patch('/:id/unpublish', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    const post = await postService.unpublishPost(id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ error: 'Failed to unpublish post' });
  }
});

// Feature post
router.patch('/:id/feature', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    const post = await postService.featurePost(id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ error: 'Failed to feature post' });
  }
});

// Unfeature post
router.patch('/:id/unfeature', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    const post = await postService.unfeaturePost(id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ error: 'Failed to unfeature post' });
  }
});

// Delete post
router.delete('/:id', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    const deleted = await postService.deletePost(id);
    if (!deleted) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;
