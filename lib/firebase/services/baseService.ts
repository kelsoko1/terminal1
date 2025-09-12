import { adminDb } from '../admin';
import { Timestamp } from 'firebase-admin/firestore';

export class BaseService<T extends { id?: string }> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  // Create a new document
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>, id?: string): Promise<T> {
    const now = Timestamp.now();
    const docRef = id 
      ? adminDb.collection(this.collectionName).doc(id)
      : adminDb.collection(this.collectionName).doc();
    
    const docData = {
      ...data,
      createdAt: now,
      updatedAt: now,
    } as Omit<T, 'id'>;

    await docRef.set(docData);
    
    return {
      ...docData,
      id: docRef.id,
    } as unknown as T;
  }

  // Get a document by ID
  async getById(id: string): Promise<T | null> {
    const doc = await adminDb.collection(this.collectionName).doc(id).get();
    if (!doc.exists) return null;
    
    return {
      id: doc.id,
      ...doc.data(),
    } as T;
  }

  // Update a document
  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T | null> {
    const docRef = adminDb.collection(this.collectionName).doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    
    const now = Timestamp.now();
    const updateData = {
      ...data,
      updatedAt: now,
    } as unknown as Partial<T>;
    
    await docRef.update(updateData);
    
    return {
      ...doc.data(),
      ...updateData,
      id: doc.id,
    } as unknown as T;
  }

  // Delete a document
  async delete(id: string): Promise<boolean> {
    const docRef = adminDb.collection(this.collectionName).doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) return false;
    
    await docRef.delete();
    return true;
  }

  // List all documents with optional query
  async list(
    where?: [string, FirebaseFirestore.WhereFilterOp, any],
    orderBy?: { field: string; direction: FirebaseFirestore.OrderByDirection }
  ): Promise<T[]> {
    let query: FirebaseFirestore.Query = adminDb.collection(this.collectionName);
    
    if (where) {
      query = query.where(where[0], where[1], where[2]);
    }
    
    if (orderBy) {
      query = query.orderBy(orderBy.field, orderBy.direction);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as T));
  }

  // Helper to handle Firestore data conversion
  protected convertTimestamps(data: any): any {
    if (data === null || typeof data !== 'object') return data;
    
    // Convert Firestore Timestamp to Date
    if (data.seconds && data.nanoseconds) {
      return new Date(data.seconds * 1000 + data.nanoseconds / 1000000);
    }
    
    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.convertTimestamps(item));
    }
    
    // Handle nested objects
    const result: any = {};
    for (const key in data) {
      result[key] = this.convertTimestamps(data[key]);
    }
    
    return result;
  }
}
