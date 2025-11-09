import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

if (!admin.apps.length) {
  try {
    const serviceAccountPath = resolve(
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
        './firebase-service-account.json',
    );
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    throw new Error(
      'Firebase configuration failed. Please check your service account file.',
    );
  }
}

const firebaseAdmin = admin;
export default firebaseAdmin;
