import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  serverTimestamp, 
  runTransaction, 
  Timestamp, 
  getDoc,
  orderBy,
  limit,
  WithFieldValue,
  QueryDocumentSnapshot,
  DocumentData,
  Firestore,
  CollectionReference,
  QueryDocumentSnapshot as FirestoreQueryDocumentSnapshot,
  Query,
  DocumentReference
} from 'firebase/firestore';
import { db } from '../config';
import { FirebaseError } from 'firebase/app';

// Type assertion for the db instance
const firestoreDb = db as Firestore;

// Type for a Firestore document with ID
type DocumentWithId<T> = T & { id: string };

// Type guard to check if db is properly initialized
function assertDbInitialized(db: unknown): asserts db is Firestore {
  if (!db) {
    throw new Error('Firestore database is not properly initialized');
  }
}

// Helper function to safely get a collection reference
function getCollectionRef<T = DocumentData>(path: string): CollectionReference<T> {
  assertDbInitialized(firestoreDb);
  return collection(firestoreDb, path) as CollectionReference<T>;
}

// Helper function to safely create a query
function createQuery<T = DocumentData>(
  collectionPath: string, 
  constraints: any[] = []
): Query<T> {
  const ref = getCollectionRef<T>(collectionPath);
  return query(ref, ...constraints) as Query<T>;
}

export type TransactionType = 
  | 'deposit' 
  | 'withdrawal' 
  | 'transfer' 
  | 'payment' 
  | 'refund' 
  | 'bonus' 
  | 'fee' 
  | 'adjustment' 
  | 'other';

export type TransactionStatus = 
  | 'pending' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'refunded';

export interface WalletTransaction {
  id?: string;
  userId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  referenceId?: string;
  metadata?: Record<string, any>;
  createdAt: Timestamp | Date | string;
  updatedAt: Timestamp | Date | string;
  currency?: string;
  fee?: number;
  netAmount?: number;
  paymentMethod?: string;
  paymentProvider?: string;
  paymentDetails?: Record<string, any>;
}

/**
 * Converts a Firestore document to a WalletTransaction object
 * @param doc - The Firestore document snapshot
 * @returns A WalletTransaction object
 */
const toWalletTransaction = (doc: QueryDocumentSnapshot<DocumentData>): WalletTransaction => {
  const data = doc.data();
  
  // Safely convert Firestore Timestamps to JavaScript Dates
  const convertTimestamp = (timestamp: any): Date | string => {
    if (!timestamp) return new Date().toISOString();
    if (timestamp.toDate instanceof Function) return timestamp.toDate().toISOString();
    if (timestamp instanceof Date) return timestamp.toISOString();
    return timestamp;
  };

  return {
    id: doc.id,
    userId: String(data.userId || ''),
    amount: Number(data.amount || 0),
    type: data.type as TransactionType,
    status: data.status as TransactionStatus,
    description: String(data.description || ''),
    referenceId: data.referenceId ? String(data.referenceId) : undefined,
    metadata: data.metadata && typeof data.metadata === 'object' ? data.metadata : {},
    currency: data.currency || 'USD',
    fee: Number(data.fee || 0),
    netAmount: Number(data.netAmount || data.amount || 0),
    paymentMethod: data.paymentMethod ? String(data.paymentMethod) : undefined,
    paymentProvider: data.paymentProvider ? String(data.paymentProvider) : undefined,
    paymentDetails: data.paymentDetails && typeof data.paymentDetails === 'object' ? data.paymentDetails : {},
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt)
  };
};

/**
 * Converts a WalletTransaction to Firestore document data
 * @param transaction - The wallet transaction data
 * @returns Data ready for Firestore
 */
const toFirestoreData = (transaction: Partial<WalletTransaction>): WithFieldValue<DocumentData> => {
  const { id, ...data } = transaction;
  const now = serverTimestamp();
  
  // Prepare the data object with only the fields we want to store
  const firestoreData: Record<string, any> = {
    ...data,
    updatedAt: now,
  };
  
  // Only set createdAt if it's a new document
  if (!id) {
    firestoreData.createdAt = now;
  }
  
  return firestoreData;
};

/**
 * Recursively converts Firestore Timestamps to JavaScript Dates
 * @param data - The data to process
 * @returns Data with Timestamps converted to Dates
 */
const convertTimestamps = <T>(data: T): T => {
  // Handle null/undefined
  if (data === null || data === undefined) {
    return data;
  }
  
  // Handle Timestamp
  if (data instanceof Timestamp) {
    return data.toDate() as unknown as T;
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(convertTimestamps) as unknown as T;
  }
  
  // Handle plain objects (but not Dates, which are also objects)
  if (typeof data === 'object' && !(data instanceof Date)) {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = convertTimestamps(value);
    }
    return result as T;
  }
  
  // Return primitives and Dates as-is
  return data;
};

// Helper to validate transaction amount
const validateAmount = (amount: unknown): number => {
  const num = Number(amount);
  if (isNaN(num) || !isFinite(num)) {
    throw new Error('Invalid amount: must be a valid number');
  }
  return num;
};

// Helper to validate user ID
const validateUserId = (userId: unknown): string => {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid user ID');
  }
  return userId;
};

/**
 * Wallet service for handling wallet operations
 */
export const walletService = {
  /**
   * Get wallet balance for a user
   * @param userId - User ID
   * @returns Current wallet balance
   * @throws {Error} If there's an error fetching the balance
   */
  async getWalletBalance(userId: string): Promise<number> {
    try {
      validateUserId(userId);
      
      const q = createQuery<WalletTransaction>('walletTransactions', [
        where('userId', '==', userId),
        where('status', 'in', ['completed', 'pending'])
      ]);
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.reduce((total, doc) => {
        const data = doc.data();
        const amount = Number(data.amount) || 0;
        return total + amount;
      }, 0);
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      
      // Provide more specific error messages based on the error type
      if (error instanceof FirebaseError) {
        if (error.code === 'permission-denied') {
          throw new Error('Permission denied: You do not have access to this wallet');
        }
        if (error.code === 'unavailable') {
          throw new Error('Service unavailable: Please check your internet connection');
        }
      }
      
      throw new Error('Failed to retrieve wallet balance');
    }
  },

  /**
   * Get recent transactions for a user
   * @param userId - User ID
   * @param limitCount - Maximum number of transactions to return (1-100)
   * @returns Array of recent transactions
   * @throws {Error} If there's an error fetching transactions
   */
  async getRecentTransactions(userId: string, limitCount: number = 10): Promise<WalletTransaction[]> {
    try {
      validateUserId(userId);
      
      const safeLimit = Math.min(Math.max(1, limitCount), 100); // Enforce reasonable limits
      
      const q = createQuery<WalletTransaction>('walletTransactions', [
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(safeLimit)
      ]);
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        try {
          return toWalletTransaction(doc);
        } catch (error) {
          console.error('Error processing transaction document:', error);
          // Return a minimal valid transaction object for error cases
          return {
            id: doc.id,
            userId,
            amount: 0,
            type: 'other',
            status: 'failed',
            description: 'Error processing transaction',
            metadata: { error: 'Failed to process transaction data' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as WalletTransaction;
        }
      });
    } catch (error) {
      console.error('Error getting recent transactions:', error);
      
      // Provide more specific error messages
      if (error instanceof FirebaseError) {
        if (error.code === 'permission-denied') {
          throw new Error('Permission denied: Cannot access transaction history');
        }
        if (error.code === 'unavailable') {
          throw new Error('Service unavailable: Please check your internet connection');
        }
      }
      
      throw new Error('Failed to retrieve recent transactions');
    }
  },

  /**
   * Add a transaction to the wallet
   * @param transaction - Transaction data
   * @returns The created transaction
   * @throws {Error} If the transaction data is invalid or there's an error saving
   */
  async addTransaction(transaction: Omit<WalletTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<WalletTransaction> {
    // Validate required fields
    if (!transaction.userId) {
      throw new Error('User ID is required');
    }
    
    if (typeof transaction.amount !== 'number' || isNaN(transaction.amount)) {
      throw new Error('Valid amount is required');
    }
    
    if (!transaction.type) {
      throw new Error('Transaction type is required');
    }
    
    if (!transaction.status) {
      throw new Error('Transaction status is required');
    }
    
    // Prepare transaction data
    const transactionData = toFirestoreData({
      ...transaction,
      // Ensure metadata is always an object
      metadata: transaction.metadata && typeof transaction.metadata === 'object' 
        ? transaction.metadata 
        : {}
    });
    
    try {
      // Get collection reference
      const transactionsRef = getCollectionRef<WalletTransaction>('walletTransactions');
      
      // Add to Firestore
      const docRef = await addDoc(transactionsRef, transactionData);
      
      // Return the created transaction
      const createdDoc = await getDoc(docRef);
      if (!createdDoc.exists()) {
        throw new Error('Failed to retrieve created transaction');
      }
      
      return toWalletTransaction(createdDoc as FirestoreQueryDocumentSnapshot<DocumentData>);
      
    } catch (error) {
      console.error('Error adding transaction:', error);
      
      // Provide more specific error messages
      if (error instanceof FirebaseError) {
        if (error.code === 'permission-denied') {
          throw new Error('Permission denied: Cannot add transaction');
        }
        if (error.code === 'resource-exhausted') {
          throw new Error('Quota exceeded: Please try again later');
        }
      }
      
      throw error instanceof Error 
        ? error 
        : new Error('Failed to add transaction');
    }
  },

  /**
   * Add funds to wallet
   * @param userId - User ID
   * @param amount - Amount to add (must be positive)
   * @param paymentMethod - Payment method used
   * @param referenceId - Optional reference ID for the transaction
   * @param metadata - Additional metadata for the transaction
   * @returns The created transaction
   * @throws {Error} If the operation fails
   */
  async addFunds(
    userId: string, 
    amount: number, 
    paymentMethod: string = 'card',
    referenceId?: string,
    metadata: Record<string, any> = {}
  ): Promise<WalletTransaction> {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    
    try {
      // Add a credit transaction
      return await this.addTransaction({
        userId,
        amount: Math.abs(amount), // Ensure positive amount
        type: 'deposit',
        description: `Added funds via ${paymentMethod}`,
        status: 'completed',
        referenceId,
        metadata: { ...metadata, paymentMethod },
        currency: 'USD',
        paymentMethod
      });
    } catch (error) {
      console.error('Error adding funds:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Failed to add funds to wallet');
    }
  },

  /**
   * Withdraw funds from wallet
   * @param userId - User ID
   * @param amount - Amount to withdraw (must be positive)
   * @param paymentMethod - Payment method used
   * @param referenceId - Optional reference ID for the transaction
   * @param metadata - Additional metadata for the transaction
   * @returns The created transaction
   * @throws {Error} If the operation fails or there are insufficient funds
   */
  async withdrawFunds(
    userId: string, 
    amount: number, 
    paymentMethod: string = 'bank_transfer',
    referenceId?: string,
    metadata: Record<string, any> = {}
  ): Promise<WalletTransaction> {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    
    try {
      const balance = await this.getWalletBalance(userId);
      
      if (balance < amount) {
        throw new Error('Insufficient funds');
      }
      
      // Add a debit transaction (negative amount)
      return await this.addTransaction({
        userId,
        amount: -Math.abs(amount), // Ensure negative amount
        type: 'withdrawal',
        description: `Withdrew funds via ${paymentMethod}`,
        status: 'completed',
        referenceId,
        metadata: { ...metadata, paymentMethod },
        currency: 'USD',
        paymentMethod
      });
    } catch (error) {
      console.error('Error in withdrawFunds:', error);
      // Log the error but don't expose internal details to the client
      throw error instanceof Error 
        ? error 
        : new Error('Failed to process withdrawal');
    }
  }
};
