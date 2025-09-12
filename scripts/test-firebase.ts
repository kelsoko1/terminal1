import 'dotenv/config';
import admin from 'firebase-admin';
import { getApps, initializeApp, cert } from 'firebase-admin/app';

console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID from env:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('FIREBASE_CLIENT_EMAIL from env:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('FIREBASE_PRIVATE_KEY from env:', process.env.FIREBASE_PRIVATE_KEY ? 'loaded' : 'not loaded');
console.log('FIREBASE_SERVICE_ACCOUNT_JSON from env:', process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? 'loaded' : 'not loaded');

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  : {
      project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

console.log('Service account object being passed to cert():', serviceAccount);

// Initialize Firebase Admin
const firebaseAdminConfig = {
  credential: cert(serviceAccount),
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`
};

if (!getApps().length) {
  initializeApp(firebaseAdminConfig);
  console.log('Firebase Admin SDK initialized successfully!');
} else {
    console.log('Firebase Admin SDK already initialized.');
}
