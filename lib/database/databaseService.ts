import { getDatabase, markForSync } from './localDatabase';
import { useDatabase, useDatabaseOperation } from './DatabaseContext';

/**
 * Generic database service that handles both local and remote database operations
 * This service provides a unified API for database operations with automatic sync tracking
 */
export class DatabaseService<T extends { id: string }> {
  private modelName: string;

  constructor(modelName: string) {
    this.modelName = modelName;
  }

  /**
   * Create a new record
   */
  async create(data: Omit<T, 'id'>): Promise<T> {
    const db = await getDatabase();
    // @ts-ignore - Dynamic access to Prisma models
    const result = await db[this.modelName].create({
      data,
    });

    // Mark for sync if using local database
    const { useLocalDatabase } = useDatabase();
    if (useLocalDatabase) {
      await markForSync(this.modelName, result.id);
    }

    return result;
  }

  /**
   * Find a record by ID
   */
  async findById(id: string): Promise<T | null> {
    const db = await getDatabase();
    // @ts-ignore - Dynamic access to Prisma models
    return db[this.modelName].findUnique({
      where: { id },
    });
  }

  /**
   * Find many records with optional filters
   */
  async findMany(params: any = {}): Promise<T[]> {
    const db = await getDatabase();
    // @ts-ignore - Dynamic access to Prisma models
    return db[this.modelName].findMany(params);
  }

  /**
   * Update a record
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    const db = await getDatabase();
    // @ts-ignore - Dynamic access to Prisma models
    const result = await db[this.modelName].update({
      where: { id },
      data,
    });

    // Mark for sync if using local database
    const { useLocalDatabase } = useDatabase();
    if (useLocalDatabase) {
      await markForSync(this.modelName, id);
    }

    return result;
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<T> {
    const db = await getDatabase();
    // @ts-ignore - Dynamic access to Prisma models
    return db[this.modelName].delete({
      where: { id },
    });
  }

  /**
   * Count records with optional filters
   */
  async count(where: any = {}): Promise<number> {
    const db = await getDatabase();
    // @ts-ignore - Dynamic access to Prisma models
    return db[this.modelName].count({ where });
  }
}

/**
 * Create specific service instances for each model
 */
export const userService = new DatabaseService<any>('User');
export const organizationService = new DatabaseService<any>('Organization');
export const subscriptionService = new DatabaseService<any>('Subscription');
export const planService = new DatabaseService<any>('SubscriptionPlan');
export const paymentService = new DatabaseService<any>('Payment');
export const postService = new DatabaseService<any>('Post');
export const commentService = new DatabaseService<any>('Comment');
export const attachmentService = new DatabaseService<any>('Attachment');

/**
 * Hook for using database services with sync tracking
 */
export function useModelService<T extends { id: string }>(modelName: string) {
  const { executeOperation } = useDatabaseOperation();
  const service = new DatabaseService<T>(modelName);

  return {
    create: (data: Omit<T, 'id'>) => 
      executeOperation(() => service.create(data), modelName),
    
    findById: (id: string) => 
      executeOperation(() => service.findById(id)),
    
    findMany: (params: any = {}) => 
      executeOperation(() => service.findMany(params)),
    
    update: (id: string, data: Partial<T>) => 
      executeOperation(() => service.update(id, data), modelName, id),
    
    delete: (id: string) => 
      executeOperation(() => service.delete(id), modelName, id),
    
    count: (where: any = {}) => 
      executeOperation(() => service.count(where))
  };
}
