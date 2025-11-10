import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

class FirebaseService {
  public messaging: admin.messaging.Messaging;

  constructor() {
    this.initializeFirebase();
    this.messaging = admin.messaging();
  }

  private initializeFirebase() {
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

  public async sendToTokens(
    tokens: string[],
    title: string,
    body: string,
    data: { [key: string]: string } = {},
  ) {
    if (tokens.length === 0) {
      return;
    }

    const message: admin.messaging.MulticastMessage = {
      tokens: tokens,
      notification: {
        title: title,
        body: body,
      },
      data: data,
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
      android: {
        notification: {
          sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        },
      },
    };

    try {
      const response = await this.messaging.sendEachForMulticast(message);
      console.log(`Successfully sent ${response.successCount} messages.`);

      if (response.failureCount > 0) {
        console.log(`Failed to send ${response.failureCount} messages.`);
        const failedTokens: string[] = [];

        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(
              `Failure details for token [${tokens[idx]}]:`,
              JSON.stringify(resp, null, 2),
            );
            failedTokens.push(tokens[idx]);
          }
        });

        await this.cleanupFailedTokens(failedTokens);
      }
    } catch (e) {
      console.error('Error sending multicast message:', e);
    }
  }

  private async cleanupFailedTokens(tokens: string[]) {
    if (tokens.length === 0) {
      return;
    }

    try {
      await prisma.fCMToken.deleteMany({
        where: {
          token: {
            in: tokens,
          },
        },
      });
      console.log('Failed tokens cleaned up.');
    } catch (e) {
      console.error('Error cleaning up failed tokens:', e);
    }
  }
}

export const firebaseService = new FirebaseService();
export const firebaseAdmin = admin;
