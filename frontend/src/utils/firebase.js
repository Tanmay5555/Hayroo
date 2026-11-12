/**
 * Firebase Client SDK for ApexBazaar Front-End
 * Powers:
 * - Phone OTP Login with invisible reCAPTCHA
 * - Google Social Sign-in
 * - Firestore real-time BazaarGuide Chat & Courier GPS streams
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA_MockApiKeyForLocalDev123456',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'apexbazaar-dev.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'apexbazaar-dev',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'apexbazaar-dev.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456',
};

let app = null;
let auth = null;
let firestore = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  firestore = getFirestore(app);
} catch (err) {
  console.warn('⚠️ Firebase Client SDK init warning:', err.message);
}

/**
 * Configure invisible reCAPTCHA for phone OTP verification
 */
export const initRecaptchaVerifier = (containerId = 'recaptcha-container') => {
  if (!auth) return null;
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        console.warn('reCAPTCHA expired. Resetting verifier.');
      },
    });
  }
  return window.recaptchaVerifier;
};

/**
 * Initiate Phone OTP SMS via Firebase
 */
export const sendPhoneOtp = async (phoneNumber, appVerifier) => {
  if (!auth) throw new Error('Firebase Auth not available');
  return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
};

/**
 * Google Social Sign-in via Firebase Popup
 */
export const signInWithGoogle = async () => {
  if (!auth) throw new Error('Firebase Auth not available');
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
};

/**
 * Sign out from Firebase
 */
export const logoutFirebase = async () => {
  if (auth) {
    await signOut(auth);
  }
};

export { app, auth, firestore };

