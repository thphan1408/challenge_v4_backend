import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { ENV } from './env.config';
import * as path from 'path';
import * as fs from 'fs';

let firebaseApp;

try {
  // Check if credentials file exists
  const credentialsPath = path.resolve(
    ENV.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccount.json',
  );

  if (!fs.existsSync(credentialsPath)) {
    throw new Error(`Firebase credentials file not found at: ${credentialsPath}`);
  }
  firebaseApp = initializeApp({
    credential: cert(credentialsPath),
    projectId: ENV.FIREBASE_PROJECT_ID,
  });
} catch (error) {
  throw new Error('Failed to initialize Firebase. Check your credentials.');
}

export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
export default firebaseApp;
