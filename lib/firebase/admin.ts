import admin from 'firebase-admin';
import { getApps, initializeApp, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  : {
      project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

// Initialize Firebase Admin
const firebaseAdminConfig = {
  credential: cert(serviceAccount),
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`
};

if (!getApps().length) {
  initializeApp(firebaseAdminConfig);
}

// Initialize services
export const adminDb = getFirestore();
export const adminAuth = getAuth();
export const adminStorage = getStorage();

// Helper function to get a Firestore document
export const getDocument = async <T>(collection: string, id: string): Promise<T | null> => {
  const doc = await adminDb.collection(collection).doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } as T : null;
};

// Helper function to query Firestore collection
export const queryCollection = async <T>(
  collection: string,
  conditions: [string, FirebaseFirestore.WhereFilterOp, any][] = [],
  orderBy?: { field: string; direction: FirebaseFirestore.OrderByDirection }
): Promise<T[]> => {
  let query: FirebaseFirestore.Query = adminDb.collection(collection);
  
  // Apply where conditions
  conditions.forEach(([field, operator, value]) => {
    query = query.where(field, operator, value);
  });
  
  // Apply ordering if specified
  if (orderBy) {
    query = query.orderBy(orderBy.field, orderBy.direction);
  }
  
  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
};

// Helper function to create or update a document
export const setDocument = async <T>(
  collection: string,
  id: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
  merge = true
): Promise<T> => {
  const now = new Date();
  const docRef = adminDb.collection(collection).doc(id);
  
  await docRef.set(
    {
      ...data,
      updatedAt: now,
      ...(merge ? {} : { createdAt: now })
    },
    { merge }
  );
  
  return { id, ...data, createdAt: now, updatedAt: now } as T;
};

// Helper function to delete a document
export const deleteDocument = async (collection: string, id: string): Promise<void> => {
  await adminDb.collection(collection).doc(id).delete();
};

// Type for Firestore timestamp conversion
type FirestoreTimestamp = {
  toDate: () => Date;
  toMillis: () => number;
  isEqual: (other: FirestoreTimestamp) => boolean;
  valueOf: () => string;
};

// Convert Firestore data to plain objects
export const convertFirestoreDates = <T>(data: any): T => {
  if (data === null || typeof data !== 'object') return data;
  
  if (data.toDate && typeof data.toDate === 'function') {
    return data.toDate();
  }
  
  if (Array.isArray(data)) {
    return data.map(item => convertFirestoreDates(item)) as unknown as T;
  }
  
  const result: any = {};
  for (const key in data) {
    result[key] = convertFirestoreDates(data[key]);
  }
  
  return result as T;
};
