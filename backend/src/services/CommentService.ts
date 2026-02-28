import { AppDataSource } from '../config/database';
import { Comment } from '../models/Comment';
import { CommentLike } from '../models/CommentLike';

export interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
  userHasLiked?: boolean;
}

export class CommentService {
  private commentRepository = AppDataSource.getRepository(Comment);
  private commentLikeRepository = AppDataSource.getRepository(CommentLike);

  async createComment(
    content: string,
    postId: number,
    userId: number,
    parentCommentId?: number
  ): Promise<Comment> {
    if (parentCommentId) {
      const parentComment = await this.getCommentById(parentCommentId);
      if (!parentComment) {
        throw new Error('Parent comment not found');
      }
    }

    const comment = this.commentRepository.create({
      content,
      postId,
      userId,
      parentCommentId: parentCommentId || null,
      isApproved: true,
    });

    return this.commentRepository.save(comment);
  }

  async getCommentById(id: number, includeReplies: boolean = false): Promise<Comment | null> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'post', ...(includeReplies ? ['replies'] : [])],
    });

    if (comment && includeReplies && comment.replies) {
      comment.replies = await Promise.all(
        comment.replies.map(reply => this.getCommentById(reply.id, true))
      );
    }

    return comment;
  }

  async getCommentsByPostId(
    postId: number,
    includeReplies: boolean = true,
    approvedOnly: boolean = true
  ): Promise<CommentWithReplies[]> {
    let query = this.commentRepository.createQueryBuilder('comment');

    query = query
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.parentCommentId IS NULL');

    if (approvedOnly) {
      query = query.andWhere('comment.isApproved = :isApproved', { isApproved: true });
    }

    query = query
      .leftJoinAndSelect('comment.user', 'user')
      .orderBy('comment.createdAt', 'DESC');

    let comments = await query.getMany();

    if (includeReplies) {
      comments = await Promise.all(
        comments.map(comment => this.buildCommentTree(comment, approvedOnly))
      );
    }

    return comments as CommentWithReplies[];
  }

  private async buildCommentTree(comment: Comment, approvedOnly: boolean = true): Promise<CommentWithReplies> {
    let query = this.commentRepository.createQueryBuilder('reply');

    query = query
      .where('reply.parentCommentId = :parentId', { parentId: comment.id })
      .leftJoinAndSelect('reply.user', 'user');

    if (approvedOnly) {
      query = query.andWhere('reply.isApproved = :isApproved', { isApproved: true });
    }

    query = query.orderBy('reply.createdAt', 'DESC');
    const replies = await query.getMany();

    const treeReplies = await Promise.all(
      replies.map(reply => this.buildCommentTree(reply, approvedOnly))
    );

    return {
      ...comment,
      replies: treeReplies,
    };
  }

  async updateComment(id: number, content: string): Promise<Comment | null> {
    await this.commentRepository.update(id, { content, updatedAt: new Date() });
    return this.getCommentById(id);
  }

  async deleteComment(id: number): Promise<boolean> {
    const result = await this.commentRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async getReplies(parentCommentId: number, approvedOnly: boolean = true): Promise<CommentWithReplies[]> {
    let query = this.commentRepository.createQueryBuilder('comment');

    query = query
      .where('comment.parentCommentId = :parentCommentId', { parentCommentId })
      .leftJoinAndSelect('comment.user', 'user');

    if (approvedOnly) {
      query = query.andWhere('comment.isApproved = :isApproved', { isApproved: true });
    }

    query = query.orderBy('comment.createdAt', 'DESC');

    let comments = await query.getMany();
    comments = await Promise.all(
      comments.map(comment => this.buildCommentTree(comment, approvedOnly))
    );

    return comments as CommentWithReplies[];
  }

  async likeComment(commentId: number, userId: number): Promise<boolean> {
    const comment = await this.getCommentById(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    const existingLike = await this.commentLikeRepository.findOne({
      where: { commentId, userId },
    });

    if (existingLike) {
      return false;
    }

    const like = this.commentLikeRepository.create({ commentId, userId });
    await this.commentLikeRepository.save(like);

    await this.commentRepository.increment({ id: commentId }, 'likeCount', 1);

    return true;
  }

  async unlikeComment(commentId: number, userId: number): Promise<boolean> {
    const like = await this.commentLikeRepository.findOne({
      where: { commentId, userId },
    });

    if (!like) {
      return false;
    }

    await this.commentLikeRepository.delete(like.id);
    await this.commentRepository.decrement({ id: commentId }, 'likeCount', 1);

    return true;
  }

  async hasUserLiked(commentId: number, userId: number): Promise<boolean> {
    const like = await this.commentLikeRepository.findOne({
      where: { commentId, userId },
    });

    return !!like;
  }

  async getCommentLikes(commentId: number): Promise<number> {
    const like = await this.commentRepository.findOne({
      where: { id: commentId },
      select: ['likeCount'],
    });

    return like?.likeCount || 0;
  }

  async approveComment(id: number, moderationNote?: string): Promise<Comment | null> {
    await this.commentRepository.update(id, {
      isApproved: true,
      isSpam: false,
      moderationNote,
    });

    return this.getCommentById(id);
  }

  async rejectComment(id: number, reason: string): Promise<Comment | null> {
    await this.commentRepository.update(id, {
      isApproved: false,
      moderationNote: reason,
    });

    return this.getCommentById(id);
  }

  async markAsSpam(id: number): Promise<Comment | null> {
    await this.commentRepository.update(id, {
      isSpam: true,
      isApproved: false,
      moderationNote: 'Marked as spam',
    });

    return this.getCommentById(id);
  }

  async getUnapprovedComments(postId?: number): Promise<Comment[]> {
    let query = this.commentRepository.createQueryBuilder('comment');

    query = query.where('comment.isApproved = :isApproved', { isApproved: false });

    if (postId) {
      query = query.andWhere('comment.postId = :postId', { postId });
    }

    query = query
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.post', 'post')
      .orderBy('comment.createdAt', 'ASC');

    return query.getMany();
  }

  async getCommentStats(postId: number): Promise<{
    total: number;
    approved: number;
    pending: number;
    spam: number;
  }> {
    const [total, approved, pending, spam] = await Promise.all([
      this.commentRepository.count({ where: { postId } }),
      this.commentRepository.count({
        where: { postId, isApproved: true, isSpam: false },
      }),
      this.commentRepository.count({
        where: { postId, isApproved: false, isSpam: false },
      }),
      this.commentRepository.count({
        where: { postId, isSpam: true },
      }),
    ]);

    return { total, approved, pending, spam };
  }

  async searchComments(postId: number, query: string): Promise<Comment[]> {
    return this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.isApproved = :isApproved', { isApproved: true })
      .andWhere('comment.content ILIKE :query', { query: `%${query}%` })
      .leftJoinAndSelect('comment.user', 'user')
      .orderBy('comment.createdAt', 'DESC')
      .getMany();
  }
}
