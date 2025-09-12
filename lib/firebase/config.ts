import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
// Firebase configuration - these values should be set in environment variables
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let firebaseApp: FirebaseApp | null = null;

// Only initialize on the server or in the browser
if (typeof window === 'undefined' || getApps().length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
}

// Get existing app if already initialized
if (!firebaseApp && getApps().length > 0) {
  firebaseApp = getApps()[0];
}

// Initialize Firebase services only if we have a valid app
const db = firebaseApp ? getFirestore(firebaseApp) : null;
const auth = firebaseApp ? getAuth(firebaseApp) : null;
const storage = firebaseApp ? getStorage(firebaseApp) : null;

// Initialize Analytics only in the browser and if supported
let analytics: ReturnType<typeof getAnalytics> | null = null;

if (typeof window !== 'undefined' && firebaseApp) {
  // Only initialize analytics if we're in the browser and have a valid app
  isSupported().then((supported) => {
    if (supported && firebaseApp) {  // Check firebaseApp again in case it became null
      analytics = getAnalytics(firebaseApp);
    }
  });
}

export { firebaseApp, db, auth, storage, analytics };

// Helper function to handle Firestore timestamps in client components
export const formatFirestoreTimestamp = (timestamp: any): string => {
  if (!timestamp) return '';
  
  // If it's a Firestore Timestamp
  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toLocaleString();
  }
  
  // If it's already a Date object or string
  return new Date(timestamp).toLocaleString();
};

// Type for Firestore document with ID
export type WithId<T> = T & { id: string };
