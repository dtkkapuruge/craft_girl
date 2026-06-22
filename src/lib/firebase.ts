import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase Client SDK Configuration using environment variables
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'mock-key-to-prevent-build-error',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'mock-domain.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mock-project-id',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'mock-project-id.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789012:web:abc123def456',
};

// Debug: log a masked API key client-side to confirm the value loaded (temporary)
if (typeof window !== 'undefined') {
  try {
    const k = firebaseConfig.apiKey || '';
    // show first 6 chars and length to avoid exposing full key
    // remove this log after debugging
    // eslint-disable-next-line no-console
    console.debug('Firebase API key loaded:', k ? `${k.slice(0,6)}... (len=${k.length})` : '<<missing>>');
  } catch (e) {
    // ignore
  }
}

// Initialize Firebase app (prevent re-initialization during hot reloading)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize services and export them explicitly
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
