/**
 * Firebase Admin SDK Configuration & Multi-Service Gateway
 * Handles:
 * 1. Firebase Auth ID Token verification for Phone OTP and Social Login
 * 2. Custom User Claims setting (e.g. role: SELLER, ADMIN, etc.)
 * 3. Firestore persistent streams for BazaarGuide chat and courier GPS telemetry
 * 4. Firebase Cloud Storage for KYC and media documents
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

let admin = null;
let firebaseAuth = null;
let firestore = null;
let firebaseStorage = null;
let isConfigured = false;

try {
  const { initializeApp, cert, getApps } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  let rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();

  let privateKey = null;
  if (rawPrivateKey) {
    if (rawPrivateKey.startsWith('"') && rawPrivateKey.endsWith('"')) {
      rawPrivateKey = rawPrivateKey.slice(1, -1);
    } else if (rawPrivateKey.startsWith("'") && rawPrivateKey.endsWith("'")) {
      rawPrivateKey = rawPrivateKey.slice(1, -1);
    }
    privateKey = rawPrivateKey.replace(/\\n/g, '\n');
  }

  if (
    projectId &&
    clientEmail &&
    privateKey &&
    !projectId.includes('your') &&
    projectId !== 'apexbazaar-dev'
  ) {
    const apps = getApps();
    const app = apps.length > 0 ? apps[0] : initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
    firebaseAuth = getAuth(app);
    
    // Optional firestore/storage if available
    try {
      const { getFirestore } = await import('firebase-admin/firestore');
      firestore = getFirestore(app);
    } catch {}

    try {
      const { getStorage } = await import('firebase-admin/storage');
      firebaseStorage = getStorage(app);
    } catch {}

    isConfigured = true;
    console.log('🔥 Firebase Admin SDK initialized successfully for project:', projectId);
  } else {
    if (process.env.NODE_ENV === 'production') {
      const missing = [];
      if (!projectId) missing.push('FIREBASE_PROJECT_ID');
      if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
      if (!privateKey) missing.push('FIREBASE_PRIVATE_KEY');
      console.error(`❌ Firebase Admin SDK is not configured in production. Missing env vars: ${missing.join(', ')}`);
    }
    const mock = createMockFirebase();
    firebaseAuth = mock.auth;
    firestore = mock.firestore;
    firebaseStorage = mock.storage;
  }
} catch (err) {
  console.warn(`ℹ️ Firebase Admin SDK fallback activated (${err.message}).`);
  const mock = createMockFirebase();
  firebaseAuth = mock.auth;
  firestore = mock.firestore;
  firebaseStorage = mock.storage;
}

/**
 * Resilient mock for offline testing and local development (blocked in production auth)
 */
function createMockFirebase() {
  const claimsStore = new Map();
  const firestoreStore = new Map();

  return {
    auth: {
      verifyIdToken: async (token) => {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('Firebase Admin SDK is not configured in production. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your Render environment variables.');
        }
        if (!token) throw new Error('Firebase ID token is required');
        // Support simulated tokens for tests (e.g. "mock-token-uid123" or standard test tokens)
        if (token.startsWith('mock-token-') || token.startsWith('test-token-')) {
          const uid = token.replace(/^(mock|test)-token-/, '');
          return {
            uid: uid || 'usr_mock_firebase_123',
            phone_number: undefined,
            email: undefined,
            role: claimsStore.get(uid)?.role || 'CUSTOMER',
          };
        }
        // If an arbitrary non-empty string is passed in mock mode:
        return {
          uid: 'usr_mock_firebase_' + token.slice(0, 8),
          phone_number: undefined,
          email: undefined,
          role: 'CUSTOMER',
        };
      },
      setCustomUserClaims: async (uid, claims) => {
        claimsStore.set(uid, { ...(claimsStore.get(uid) || {}), ...claims });
        return null;
      },
      getUser: async (uid) => {
        return {
          uid,
          phoneNumber: '+919876543210',
          email: 'user@apexbazaar.com',
          customClaims: claimsStore.get(uid) || {},
        };
      },
      _claimsStore: claimsStore,
    },
    firestore: {
      collection: (colName) => ({
        doc: (docId) => ({
          set: async (data, opts = {}) => {
            const key = `${colName}/${docId}`;
            const existing = firestoreStore.get(key) || {};
            firestoreStore.set(key, opts.merge ? { ...existing, ...data } : data);
            return { id: docId };
          },
          get: async () => {
            const data = firestoreStore.get(`${colName}/${docId}`);
            return {
              exists: !!data,
              id: docId,
              data: () => data || null,
            };
          },
          collection: (subCol) => ({
            add: async (subData) => {
              const subId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
              const key = `${colName}/${docId}/${subCol}/${subId}`;
              firestoreStore.set(key, { ...subData, id: subId, timestamp: new Date().toISOString() });
              return { id: subId };
            },
            get: async () => {
              const prefix = `${colName}/${docId}/${subCol}/`;
              const docs = [];
              for (const [k, v] of firestoreStore.entries()) {
                if (k.startsWith(prefix)) {
                  docs.push({ id: v.id, data: () => v });
                }
              }
              return { docs };
            },
          }),
        }),
      }),
      _firestoreStore: firestoreStore,
    },
    storage: {
      bucket: (name) => ({
        file: (filename) => ({
          getSignedUrl: async () => [`https://storage.googleapis.com/${name}/${filename}?mock_signed=true`],
          save: async () => null,
        }),
      }),
    },
    _isMock: true,
  };
}

export const isFirebaseConfigured = () => isConfigured;
export { admin, firebaseAuth, firestore, firebaseStorage };
export default { admin, firebaseAuth, firestore, firebaseStorage, isFirebaseConfigured };
