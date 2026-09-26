import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as jose from 'jose';

if (!getApps().length) {
  try {
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'chatbot-dca8d',
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

// Export safely to prevent Vercel from crashing the entire Serverless Function on startup
export const adminDb = (() => {
  try { return getFirestore(); } catch(e) { console.error('Failed to init adminDb:', e); return null; }
})();

/**
 * Verifies a Firebase ID token manually using jose and Google public keys
 * to avoid the ESM crash in firebase-admin/auth.
 */
export async function verifyIdToken(token: string) {
  try {
    if (!token) return null;

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'chatbot-dca8d';

    // 1. Fetch Google's public certificates
    const response = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
    if (!response.ok) throw new Error('Failed to fetch Google public keys');
    const keys = await response.json();

    // 2. Decode the header to find which key signed this token
    const decodedHeader = jose.decodeProtectedHeader(token);
    const kid = decodedHeader.kid;
    if (!kid || !keys[kid]) {
      throw new Error('Public key not found for token');
    }

    // 3. Import the certificate using jose
    const cert = keys[kid];
    const publicKey = await jose.importX509(cert, 'RS256');

    // 4. Verify the signature and claims
    const { payload } = await jose.jwtVerify(token, publicKey, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    return payload;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return null;
  }
}
