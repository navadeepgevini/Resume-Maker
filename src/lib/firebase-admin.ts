import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  try {
    // In a real production app, you would load the service account from env vars
    // e.g. JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    // For this prototype, we'll initialize without a service account if one isn't provided.
    // This limits some admin capabilities but allows ID token verification if we use 
    // the project ID.
    
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'chatbot-dca8d',
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

// Export safely to prevent Vercel from crashing the entire Serverless Function on startup
export const adminAuth = (() => {
  try { return getAuth(); } catch(e) { console.error('Failed to init adminAuth:', e); return null; }
})();

export const adminDb = (() => {
  try { return getFirestore(); } catch(e) { console.error('Failed to init adminDb:', e); return null; }
})();

/**
 * Verifies a Firebase ID token and returns the decoded token.
 * If validation fails, returns null.
 */
export async function verifyIdToken(token: string) {
  try {
    if (!token || !adminAuth) return null;
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return null;
  }
}
