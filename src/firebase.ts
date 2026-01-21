import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function initializeFirebase() {
  if (admin.apps.length === 0) {
    try {
      const serviceAccountPath = resolve(
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
          './firebase-service-account.json',
      );
      const serviceAccount = JSON.parse(
        readFileSync(serviceAccountPath, 'utf8'),
      );

      admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount,
        ),
      });
      console.log('Firebase Admin initialized');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error);
      throw new Error(
        'Firebase configuration failed. Please check your service account file.',
      );
    }
  }
}

initializeFirebase();

export const firebaseAdmin = admin;
export const firebaseMessaging: admin.messaging.Messaging = admin.messaging();
