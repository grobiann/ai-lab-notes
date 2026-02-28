import React, { useState } from 'react';
import { Comment, User } from '../types/api';

interface CommentSectionProps {
  postId: number;
  comments: Comment[];
  onCommentCreate: (content: string, parentId?: number) => Promise<Comment>;
  currentUser: User;
}

/**
 * Displays comments with nested replies and like functionality
 */
export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  comments,
  onCommentCreate,
  currentUser,
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (parentCommentId?: number) => {
    if (!newComment.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await onCommentCreate(newComment, parentCommentId);
      setNewComment('');
      setReplyingTo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const renderCommentTree = (comments: Comment[], depth: number = 0): React.ReactNode => {
    return comments.map(comment => (
      <div key={comment.id} className={`comment depth-${depth}`}>
        <div className="comment-header">
          <strong>{comment.user.username}</strong>
          <time>{new Date(comment.createdAt).toLocaleDateString()}</time>
        </div>

        <p className="comment-content">{comment.content}</p>

        <div className="comment-actions">
          <button className="like-btn">
            👍 {comment.likeCount}
          </button>
          <button onClick={() => setReplyingTo(comment.id)}>Reply</button>
        </div>

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {renderCommentTree(comment.replies, depth + 1)}
          </div>
        )}

        {/* Reply form */}
        {replyingTo === comment.id && (
          <div className="reply-form">
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Write a reply..."
              rows={3}
            />
            <div className="form-actions">
              <button
                onClick={() => handleSubmit(comment.id)}
                disabled={loading || !newComment.trim()}
              >
                {loading ? 'Posting...' : 'Post Reply'}
              </button>
              <button onClick={() => setReplyingTo(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="comment-section">
      {/* New comment form */}
      <div className="comment-form">
        <h3>Leave a Comment</h3>
        <textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          rows={4}
        />
        {error && <div className="error">{error}</div>}
        <button
          onClick={() => handleSubmit()}
          disabled={loading || !newComment.trim()}
          className="btn btn-primary"
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </div>

      {/* Comments list */}
      <div className="comments">
        {comments.length === 0 ? (
          <p>No comments yet. Be the first to comment!</p>
        ) : (
          renderCommentTree(comments)
        )}
      </div>
    </div>
  );
};
