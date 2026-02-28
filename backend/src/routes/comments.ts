import { Router } from 'express';
import { CommentService } from '../services/CommentService';
import { authMiddleware, optionalAuthMiddleware, adminMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const commentService = new CommentService();

// Get comments for a post (with nested replies)
router.get('/post/:postId', optionalAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const postId = parseInt(req.params.postId);
    if (isNaN(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    const includeReplies = req.query.replies !== 'false';
    const approvedOnly = req.query.all !== 'true' || req.user?.role !== 'admin';

    const comments = await commentService.getCommentsByPostId(postId, includeReplies, approvedOnly);
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Get comment statistics for a post (admin only)
router.get('/post/:postId/stats', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const postId = parseInt(req.params.postId);
    if (isNaN(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    const stats = await commentService.getCommentStats(postId);
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comment stats' });
  }
});

// Search comments on a post
router.get('/post/:postId/search', optionalAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const query = req.query.q as string;

    if (isNaN(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    if (!query) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const comments = await commentService.searchComments(postId, query);
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search comments' });
  }
});

// Get unapproved comments (admin only)
router.get('/moderate/pending', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const postId = req.query.postId ? parseInt(req.query.postId as string) : undefined;
    const comments = await commentService.getUnapprovedComments(postId);
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending comments' });
  }
});

// Create new comment or reply
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { content, postId, parentCommentId } = req.body;

    if (!content || !postId) {
      res.status(400).json({ error: 'Content and postId are required' });
      return;
    }

    if (content.trim().length < 1) {
      res.status(400).json({ error: 'Comment cannot be empty' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const comment = await commentService.createComment(
      content,
      postId,
      req.user.userId,
      parentCommentId
    );

    res.status(201).json(comment);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create comment';
    res.status(400).json({ error: message });
  }
});

// Get replies for a comment
router.get('/:id/replies', optionalAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid comment ID' });
      return;
    }

    const approvedOnly = req.user?.role !== 'admin';
    const replies = await commentService.getReplies(id, approvedOnly);

    res.status(200).json(replies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch replies' });
  }
});

// Update comment
router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid comment ID' });
      return;
    }

    const { content } = req.body;
    if (!content) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const comment = await commentService.getCommentById(id);
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (comment.userId !== req.user.userId && req.user.role !== 'admin') {
      res.status(403).json({ error: 'You can only edit your own comments' });
      return;
    }

    const updated = await commentService.updateComment(id, content);
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update comment' });
  }
});

// Like a comment
router.post('/:id/like', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid comment ID' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const liked = await commentService.likeComment(id, req.user.userId);
    if (!liked) {
      res.status(400).json({ error: 'Already liked this comment' });
      return;
    }

    const likeCount = await commentService.getCommentLikes(id);
    res.status(200).json({ likeCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to like comment';
    res.status(400).json({ error: message });
  }
});

// Unlike a comment
router.delete('/:id/like', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid comment ID' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const unliked = await commentService.unlikeComment(id, req.user.userId);
    if (!unliked) {
      res.status(400).json({ error: 'Not liked by you' });
      return;
    }

    const likeCount = await commentService.getCommentLikes(id);
    res.status(200).json({ likeCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unlike comment' });
  }
});

// Get like status
router.get('/:id/like-status', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid comment ID' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userHasLiked = await commentService.hasUserLiked(id, req.user.userId);
    const likeCount = await commentService.getCommentLikes(id);

    res.status(200).json({ userHasLiked, likeCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch like status' });
  }
});

// Approve comment (admin only)
router.patch('/:id/approve', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid comment ID' });
      return;
    }

    const { note } = req.body;
    const comment = await commentService.approveComment(id, note);

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve comment' });
  }
});

// Reject comment (admin only)
router.patch('/:id/reject', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid comment ID' });
      return;
    }

    const { reason } = req.body;
    if (!reason) {
      res.status(400).json({ error: 'Rejection reason is required' });
      return;
    }

    const comment = await commentService.rejectComment(id, reason);
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject comment' });
  }
});

// Mark as spam (admin only)
router.patch('/:id/spam', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid comment ID' });
      return;
    }

    const comment = await commentService.markAsSpam(id);
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as spam' });
  }
});

// Delete comment
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid comment ID' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const comment = await commentService.getCommentById(id);
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (comment.userId !== req.user.userId && req.user.role !== 'admin') {
      res.status(403).json({ error: 'You can only delete your own comments' });
      return;
    }

    const deleted = await commentService.deleteComment(id);
    if (!deleted) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;
