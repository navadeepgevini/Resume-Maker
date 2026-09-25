
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';

const app = initializeApp({
  apiKey: 'AIzaSyAYgZW7Sl6M7q8fZVHSuM4yCX-p9PMfKKc',
  authDomain: 'resume-builder-cb18f.firebaseapp.com',
  projectId: 'resume-builder-cb18f',
});

const auth = getAuth(app);
try {
  const cred = await signInWithEmailAndPassword(auth, 'samplegmail07@gmail.com', 'password123');
  await deleteUser(cred.user);
  console.log('Successfully deleted the test user!');
} catch (e) {
  console.log('Error Code:', e.code);
  console.log('Error Message:', e.message);
}

