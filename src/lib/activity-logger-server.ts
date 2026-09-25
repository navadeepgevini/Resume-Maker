import { adminDb } from '@/lib/firebase-admin';

export type ActivityAction = 
  | 'USER_LOGIN' 
  | 'RESUME_UPLOADED_FOR_PARSE' 
  | 'ATS_SCORE_CHECKED' 
  | 'PDF_DOWNLOADED';

export async function logActivityServer(
  userId: string,
  userEmail: string | null,
  action: ActivityAction,
  details: Record<string, unknown> = {}
) {
  try {
    if (!adminDb) return;
    const logsRef = adminDb.collection('activityLogs');
    await logsRef.add({
      userId,
      userEmail,
      action,
      details,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to log activity server-side:', error);
  }
}
