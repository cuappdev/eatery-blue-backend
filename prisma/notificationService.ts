import cron from 'node-cron';

import { NOTIFICATION_HUB_WINDOW_HOURS } from '../src/constants.js';
import { prisma } from '../src/prisma.js';
import { sendToTokens } from '../src/utils/notifications.js';
import { getQueryTimeWindow } from '../src/utils/time.js';

function buildMessage(matchesByEatery: Map<string, string[]>): {
  title: string;
  body: string;
} {
  const title = 'Some of your favorites are being served today!';
  const eateryNames = Array.from(matchesByEatery.keys());

  if (eateryNames.length === 1) {
    const eateryName = eateryNames[0];
    const items = matchesByEatery.get(eateryName)!;
    if (items.length === 1) {
      return {
        title,
        body: `${items[0]} is being served at ${eateryName} today.`,
      };
    } else if (items.length === 2) {
      return {
        title,
        body: `${items[0]} and ${items[1]} are at ${eateryName} today.`,
      };
    } else {
      return { title, body: `Several favorites are at ${eateryName} today.` };
    }
  } else {
    const eateryListStr = eateryNames.join(', ');
    return {
      title,
      body: `Favorites found at ${eateryListStr} today. Check the app for details!`,
    };
  }
}

async function pruneOldNotifications() {
  const cutoff = new Date(
    Date.now() - NOTIFICATION_HUB_WINDOW_HOURS * 60 * 60 * 1000,
  );
  try {
    const { count } = await prisma.notification.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    console.log(`Pruned ${count} old notifications.`);
  } catch (e) {
    console.error('Error pruning old notifications:', e);
  }
}

export async function main() {
  await pruneOldNotifications();

  const { windowStartUnix, windowEndUnix } = getQueryTimeWindow();

  // build a map of { eateryName: Set<itemName> }
  const eateryMenuMap = new Map<string, Set<string>>();
  const allItemNamesToday = new Set<string>();

  const eateries = await prisma.eatery.findMany({
    include: {
      events: {
        where: {
          startTimestamp: { lte: new Date(windowEndUnix * 1000) },
          endTimestamp: { gte: new Date(windowStartUnix * 1000) },
        },
        include: {
          menu: {
            include: {
              items: true,
            },
          },
        },
      },
    },
  });

  for (const eatery of eateries) {
    if (!eateryMenuMap.has(eatery.name)) {
      eateryMenuMap.set(eatery.name, new Set<string>());
    }
    const itemSet = eateryMenuMap.get(eatery.name)!;
    for (const event of eatery.events) {
      for (const category of event.menu) {
        for (const item of category.items) {
          itemSet.add(item.name);
          allItemNamesToday.add(item.name);
        }
      }
    }
  }

  if (allItemNamesToday.size === 0) {
    console.log('No items found');
    return;
  }

  // Get all users with at least one favorite
  // item being served today (using the GIN index).
  const usersToNotify = await prisma.user.findMany({
    where: {
      favoritedItemNames: {
        hasSome: Array.from(allItemNamesToday),
      },
      // Users without FCM tokens still get a notification hub entry
    },
    include: {
      fcmTokens: true,
    },
  });

  if (usersToNotify.length === 0) {
    console.log('No users to notify');
    return;
  }

  // Build each user's aggregated notification
  const pending: {
    userId: number;
    tokens: string[];
    title: string;
    body: string;
    data: { [key: string]: string };
  }[] = [];

  for (const user of usersToNotify) {
    const userFavorites = new Set(user.favoritedItemNames);
    const userMatchesByEatery = new Map<string, string[]>();

    for (const [eateryName, itemSet] of eateryMenuMap.entries()) {
      const matches = Array.from(itemSet).filter((itemName) =>
        userFavorites.has(itemName),
      );
      if (matches.length > 0) {
        userMatchesByEatery.set(eateryName, matches.sort());
      }
    }

    if (userMatchesByEatery.size > 0) {
      const { title, body } = buildMessage(userMatchesByEatery);
      const tokens = user.fcmTokens.map((t) => t.token);

      pending.push({
        userId: user.id,
        tokens,
        title,
        body,
        data: {
          matches: JSON.stringify(Object.fromEntries(userMatchesByEatery)),
        },
      });
    }
  }

  if (pending.length === 0) {
    console.log('No users to notify');
    return;
  }

  // Save notifications to the database for the notification hub
  await prisma.notification.createMany({
    data: pending.map(({ userId, title, body }) => ({ userId, title, body })),
  });

  // Send push notifications. Users without FCM tokens are skipped
  for (const { userId, tokens, title, body, data } of pending) {
    if (tokens.length === 0) {
      continue;
    }
    try {
      await sendToTokens(tokens, title, body, data);
    } catch (e) {
      console.error(`Failed to send notification for user ${userId}:`, e);
    }
  }
}

let isRunning = false;

async function runNotificationsSafely() {
  if (isRunning) {
    console.log('[Notifications] Job is already running, skipping.');
    return;
  }

  isRunning = true;
  console.log(`[Notifications] Starting run at ${new Date().toISOString()}`);

  try {
    await main();
    console.log('[Notifications] Completed successfully.');
  } catch (error) {
    console.error('[Notifications] Failed:', error);
  } finally {
    isRunning = false;
  }
}

export function startNotificationScheduler() {
  const cronExpression = process.env.NOTI_CRON_SCHEDULE || '0 8,17 * * *';

  console.log('[Notifications] Initializing scheduler...');
  console.log(`[Notifications] Schedule: ${cronExpression}`);

  const task = cron.schedule(cronExpression, runNotificationsSafely, {
    timezone: 'America/New_York',
  });

  console.log('[Notifications] Scheduler started.');

  return task;
}

if (process.env.SCHEDULED_MODE === 'true') {
  startNotificationScheduler();
  console.log(
    '[Notifications] Notification scheduler is running. Press Ctrl+C to stop.',
  );
  const gracefulShutdown = async () => {
    console.log('[Notifications] Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
} else {
  main()
    .catch((e) => {
      console.error('Error during scraping:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
