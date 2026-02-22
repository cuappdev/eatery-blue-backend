import type admin from 'firebase-admin';

import { firebaseMessaging } from '../firebase.js';
import { prisma } from '../prisma.js';

/**
 * Send a push notification to multiple FCM tokens.
 * Automatically cleans up invalid tokens.
 */
export async function sendToTokens(
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
    const response = await firebaseMessaging.sendEachForMulticast(message);
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

      await cleanupFailedTokens(failedTokens);
    }
  } catch (e) {
    console.error('Error sending multicast message:', e);
  }
}

/**
 * Remove invalid FCM tokens from the database.
 */
async function cleanupFailedTokens(tokens: string[]) {
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
