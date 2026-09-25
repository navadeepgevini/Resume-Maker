
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

try {
  initializeApp({ projectId: 'test-project' });
  console.log('App init OK');
  getAuth();
  console.log('Auth init OK');
  getFirestore();
  console.log('Firestore init OK');
} catch (e) {
  console.error('CRASH:', e);
}

