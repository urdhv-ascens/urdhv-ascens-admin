/**
 * ŪRDHV ASCENS — FIREBASE CONFIG (SAFE COMPATIBILITY SHIM)
 * Prevents runtime crash when running in decoupled Hostinger / Cloudflare mode.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey: apiKey || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'urdhv-ascens-default',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
};

let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

// Only initialize if a valid non-dummy API key is provided
if (apiKey && apiKey !== 'undefined' && apiKey !== 'YOUR_API_KEY' && apiKey.length > 10) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const { getAuth } = await import('firebase/auth').catch(() => ({ getAuth: () => null }));
    const { getFirestore } = await import('firebase/firestore').catch(() => ({ getFirestore: () => null }));
    const { getStorage } = await import('firebase/storage').catch(() => ({ getStorage: () => null }));
    
    auth = getAuth ? getAuth(app) : null;
    db = getFirestore ? getFirestore(app) : null;
    storage = getStorage ? getStorage(app) : null;
  } catch (err) {
    console.warn('⚠️ Firebase initialization bypassed (Hostinger API is active):', err);
  }
}

export { app, auth, db, storage };
