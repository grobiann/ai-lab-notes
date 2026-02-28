import { AppDataSource } from '../config/database';
import { Post } from '../models/Post';
import { generateSlug, isValidSlug } from '../utils/slug';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SearchParams extends PaginationParams {
  query?: string;
  tags?: string[];
  category?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'featured';
  featured?: boolean;
}

export interface PostListResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PostService {
  private postRepository = AppDataSource.getRepository(Post);

  async createPost(
    title: string,
    content: string,
    authorId: number,
    description?: string,
    excerpt?: string,
    category?: string,
    isPublished: boolean = false,
    customSlug?: string
  ): Promise<Post> {
    let slug = customSlug ? customSlug.toLowerCase() : generateSlug(title);

    // Ensure unique slug
    let existingPost = await this.postRepository.findOneBy({ slug });
    let counter = 1;
    while (existingPost) {
      slug = `${customSlug || generateSlug(title)}-${counter}`;
      existingPost = await this.postRepository.findOneBy({ slug });
      counter++;
    }

    const post = this.postRepository.create({
      title,
      slug,
      content,
      authorId,
      description,
      excerpt: excerpt || this.extractExcerpt(content),
      category,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    });

    return this.postRepository.save(post);
  }

  async getPostById(id: number): Promise<Post | null> {
    return this.postRepository.findOne({
      where: { id },
      relations: ['author', 'comments', 'comments.user', 'tags'],
    });
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
    return this.postRepository.findOne({
      where: { slug },
      relations: ['author', 'comments', 'comments.user', 'tags'],
    });
  }

  async recordView(postId: number): Promise<void> {
    const post = await this.getPostById(postId);
    if (post) {
      await this.postRepository.update(postId, {
        viewCount: () => '"viewCount" + 1',
        lastViewedAt: new Date(),
      });
    }
  }

  async searchPosts(params: SearchParams): Promise<PostListResponse> {
    let query = this.postRepository.createQueryBuilder('post');

    // Base condition: only published posts for non-admin
    query = query.where('post.isPublished = :isPublished', { isPublished: true });

    // Featured filter
    if (params.featured) {
      query = query.andWhere('post.isFeatured = :isFeatured', { isFeatured: true });
    }

    // Search query
    if (params.query && params.query.trim()) {
      const searchTerm = `%${params.query}%`;
      query = query.andWhere(
        '(post.title ILIKE :searchTerm OR post.content ILIKE :searchTerm OR post.description ILIKE :searchTerm)',
        { searchTerm }
      );
    }

    // Category filter
    if (params.category) {
      query = query.andWhere('post.category = :category', { category: params.category });
    }

    // Tag filter
    if (params.tags && params.tags.length > 0) {
      query = query.innerJoinAndSelect('post.tags', 'tag');
      query = query.andWhere('tag.name IN (:...tagNames)', { tagNames: params.tags });
      query = query.groupBy('post.id').having('COUNT(tag.id) = :tagCount', { tagCount: params.tags.length });
    }

    // Sorting
    switch (params.sortBy) {
      case 'oldest':
        query = query.orderBy('post.publishedAt', 'ASC');
        break;
      case 'popular':
        query = query.orderBy('post.viewCount', 'DESC');
        break;
      case 'featured':
        query = query.orderBy('post.isFeatured', 'DESC').addOrderBy('post.publishedAt', 'DESC');
        break;
      case 'newest':
      default:
        query = query.orderBy('post.publishedAt', 'DESC');
    }

    // Pagination
    const total = await query.getCount();
    const posts = await query
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.tags', 'tags')
      .skip((params.page - 1) * params.limit)
      .take(params.limit)
      .getMany();

    return {
      posts,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  async getPublishedPosts(params: PaginationParams): Promise<PostListResponse> {
    const [posts, total] = await this.postRepository.findAndCount({
      where: { isPublished: true },
      relations: ['author', 'tags'],
      order: { publishedAt: 'DESC' },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    return {
      posts,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  async getAllPosts(params: PaginationParams): Promise<PostListResponse> {
    const [posts, total] = await this.postRepository.findAndCount({
      relations: ['author', 'tags'],
      order: { createdAt: 'DESC' },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    return {
      posts,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  async getFeaturedPosts(limit: number = 5): Promise<Post[]> {
    return this.postRepository.find({
      where: { isPublished: true, isFeatured: true },
      relations: ['author', 'tags'],
      order: { publishedAt: 'DESC' },
      take: limit,
    });
  }

  async getRelatedPosts(postId: number, limit: number = 5): Promise<Post[]> {
    const post = await this.getPostById(postId);
    if (!post || !post.tags || post.tags.length === 0) {
      return [];
    }

    const tagIds = post.tags.map(tag => tag.id);

    const posts = await this.postRepository
      .createQueryBuilder('post')
      .innerJoin('post.tags', 'tag', 'tag.id IN (:...tagIds)', { tagIds })
      .where('post.id != :postId', { postId })
      .andWhere('post.isPublished = :isPublished', { isPublished: true })
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.tags', 'tags')
      .orderBy('post.publishedAt', 'DESC')
      .take(limit)
      .getMany();

    return posts;
  }

  async getPostsByCategory(category: string, params: PaginationParams): Promise<PostListResponse> {
    const [posts, total] = await this.postRepository.findAndCount({
      where: { category, isPublished: true },
      relations: ['author', 'tags'],
      order: { publishedAt: 'DESC' },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    return {
      posts,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  async getCategories(): Promise<string[]> {
    const result = await this.postRepository
      .createQueryBuilder('post')
      .select('DISTINCT post.category', 'category')
      .where('post.isPublished = :isPublished', { isPublished: true })
      .andWhere('post.category IS NOT NULL')
      .orderBy('post.category', 'ASC')
      .getRawMany();

    return result.map(r => r.category).filter(Boolean);
  }

  async updatePost(id: number, data: Partial<Post>): Promise<Post | null> {
    // Update slug if title changed
    if (data.title && !data.slug) {
      data.slug = generateSlug(data.title);
      let existingPost = await this.postRepository.findOneBy({ slug: data.slug });
      if (existingPost && existingPost.id !== id) {
        let counter = 1;
        while (existingPost) {
          data.slug = `${generateSlug(data.title)}-${counter}`;
          existingPost = await this.postRepository.findOneBy({ slug: data.slug });
          counter++;
        }
      }
    }

    // Update excerpt if content changed
    if (data.content && !data.excerpt) {
      data.excerpt = this.extractExcerpt(data.content);
    }

    await this.postRepository.update(id, data);
    return this.getPostById(id);
  }

  async deletePost(id: number): Promise<boolean> {
    const result = await this.postRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async publishPost(id: number): Promise<Post | null> {
    return this.updatePost(id, {
      isPublished: true,
      publishedAt: new Date(),
    });
  }

  async unpublishPost(id: number): Promise<Post | null> {
    return this.updatePost(id, {
      isPublished: false,
      publishedAt: null,
    });
  }

  async featurePost(id: number): Promise<Post | null> {
    return this.updatePost(id, { isFeatured: true });
  }

  async unfeaturePost(id: number): Promise<Post | null> {
    return this.updatePost(id, { isFeatured: false });
  }

  private extractExcerpt(content: string, length: number = 150): string {
    const text = content
      .replace(/<[^>]*>/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    if (text.length <= length) {
      return text;
    }

    return text.substring(0, length).replace(/\s+\S*$/, '') + '...';
  }
}
