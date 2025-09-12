import { initializeApp, getApps } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBm5gnFQofXAOCBpod4OQrwLWDrPy-OTzY",
  authDomain: "kelsoko-bddc4.firebaseapp.com",
  projectId: "kelsoko-bddc4",
  storageBucket: "kelsoko-bddc4.appspot.com",
  messagingSenderId: "605278507250",
  appId: "1:605278507250:web:29b7b82a7b96bdc8be006b",
  measurementId: "G-1SLTEG770E"
}

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Optional: Initialize analytics only in the browser
declare global {
  interface Window { analytics?: ReturnType<typeof getAnalytics> }
}
if (typeof window !== 'undefined' && !window.analytics) {
  window.analytics = getAnalytics(app)
} 