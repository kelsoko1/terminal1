import { BaseService } from './baseService';
import { Post, PostVisibility, TradeType, AnalysisType } from '@/types/post';
import { Timestamp } from 'firebase-admin/firestore';

export class PostService extends BaseService<Post> {
  constructor() {
    super('posts');
  }

  async createPost(
    userId: string,
    content: string,
    options: {
      visibility?: PostVisibility;
      tradeSymbol?: string;
      tradeType?: TradeType;
      tradePrice?: number;
      analysisType?: AnalysisType;
      analysisSummary?: string;
      hashtags?: string[];
      mentions?: string[];
    } = {}
  ): Promise<Post> {
    const now = Timestamp.now();
    
    const postData = {
      userId,
      content,
      visibility: options.visibility || PostVisibility.PUBLIC,
      tradeSymbol: options.tradeSymbol || null,
      tradeType: options.tradeType || null,
      tradePrice: options.tradePrice || null,
      analysisType: options.analysisType || null,
      analysisSummary: options.analysisSummary || null,
      hashtags: options.hashtags || [],
      mentions: options.mentions || [],
      likes: 0,
      shares: 0,
      createdAt: now,
      updatedAt: now,
    };

    return this.create(postData);
  }

  async likePost(postId: string): Promise<number> {
    const post = await this.getById(postId);
    if (!post) throw new Error('Post not found');

    const newLikeCount = (post.likes || 0) + 1;
    await this.update(postId, { likes: newLikeCount });
    
    return newLikeCount;
  }

  async sharePost(postId: string): Promise<number> {
    const post = await this.getById(postId);
    if (!post) throw new Error('Post not found');

    const newShareCount = (post.shares || 0) + 1;
    await this.update(postId, { shares: newShareCount });
    
    return newShareCount;
  }

  async getFeedForUser(userId: string, limit = 20): Promise<Post[]> {
    // In a real app, you would implement a more sophisticated feed algorithm
    return this.list(
      ['visibility', '==', PostVisibility.PUBLIC],
      { field: 'createdAt', direction: 'desc' }
    ).then(posts => posts.slice(0, limit));
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return this.list(
      ['userId', '==', userId],
      { field: 'createdAt', direction: 'desc' }
    );
  }

  async searchPosts(query: string): Promise<Post[]> {
    // Note: Firestore doesn't support full-text search natively
    // In a production app, you'd use a dedicated search service like Algolia
    const allPosts = await this.list();
    const searchTerms = query.toLowerCase().split(' ');
    
    return allPosts.filter(post => 
      searchTerms.some(term => 
        post.content.toLowerCase().includes(term) ||
        (post.hashtags || []).some((tag: string) => tag.toLowerCase().includes(term))
      )
    );
  }
}

export const postService = new PostService();
