/**
 * Firebase Admin SDK Configuration & Multi-Service Gateway
 * Handles:
 * 1. Firebase Auth ID Token verification for Phone OTP and Social Login
 * 2. Custom User Claims setting (e.g. role: SELLER, ADMIN, etc.)
 * 3. Firestore persistent streams for BazaarGuide chat and courier GPS telemetry
 * 4. Firebase Cloud Storage for KYC and media documents
 */
import dotenv from 'dotenv';
dotenv.config();

let admin = null;
let firebaseAuth = null;
let firestore = null;
let firebaseStorage = null;
let isConfigured = false;

try {
  const firebaseAdminModule = await import('firebase-admin');
  admin = firebaseAdminModule.default || firebaseAdminModule;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (
    projectId &&
    clientEmail &&
    privateKey &&
    !projectId.includes('your') &&
    projectId !== 'apexbazaar-dev'
  ) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }
    firebaseAuth = admin.auth();
    firestore = admin.firestore();
    firebaseStorage = admin.storage();
    isConfigured = true;
    console.log('🔥 Firebase Admin SDK initialized successfully.');
  } else {
    // Offline / Local development & test mock
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
 * Resilient mock for offline testing and local development
 */
function createMockFirebase() {
  const claimsStore = new Map();
  const firestoreStore = new Map();

  return {
    auth: {
      verifyIdToken: async (token) => {
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
