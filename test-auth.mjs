
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const app = initializeApp({
  apiKey: 'AIzaSyAYgZW7Sl6M7q8fZVHSuM4yCX-p9PMfKKc',
  authDomain: 'resume-builder-cb18f.firebaseapp.com',
  projectId: 'resume-builder-cb18f',
});

const auth = getAuth(app);
try {
  await createUserWithEmailAndPassword(auth, 'test@example.com', 'password123');
  console.log('Success!');
} catch (e) {
  console.log('Error Code:', e.code);
  console.log('Error Message:', e.message);
}

