import { cert, getApps, initializeApp } from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { getMessaging } from 'firebase-admin/messaging';
import type { Messaging } from 'firebase-admin/messaging';

function initializeFirebase() {
  if (getApps().length === 0) {
    try {
      const serviceAccountPath = resolve(
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
          './firebase-service-account.json',
      );
      const serviceAccount = JSON.parse(
        readFileSync(serviceAccountPath, 'utf8'),
      );

      initializeApp({
        credential: cert(serviceAccount as ServiceAccount),
      });
      console.log('Firebase Admin initialized');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error);
      throw new Error(
        'Firebase configuration failed. Please check your service account file.',
        { cause: error },
      );
    }
  }
}

initializeFirebase();

export const firebaseMessaging: Messaging = getMessaging();
