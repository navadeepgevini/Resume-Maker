import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type ActivityAction = 
  | 'USER_LOGIN' 
  | 'RESUME_UPLOADED_FOR_PARSE' 
  | 'ATS_SCORE_CHECKED' 
  | 'PDF_DOWNLOADED';

export interface ActivityLog {
  userId: string;
  userEmail: string | null;
  action: ActivityAction;
  details: Record<string, unknown>;
  timestamp: unknown;
}

/**
 * Logs an activity to Firestore from the client side.
 * Server-side (API routes) will need to use firebase-admin.
 */
export async function logActivityClient(
  userId: string,
  userEmail: string | null,
  action: ActivityAction,
  details: Record<string, unknown> = {}
) {
  try {
    const logsRef = collection(db, 'activityLogs');
    await addDoc(logsRef, {
      userId,
      userEmail,
      action,
      details,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to log activity client-side:', error);
  }
}
