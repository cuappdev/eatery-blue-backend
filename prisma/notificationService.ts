import { formatInTimeZone } from 'date-fns-tz';
import cron from 'node-cron';

import {
  DEFAULT_SETTINGS,
  NOTIFICATION_CRON_SCHEDULE,
  NOTIFICATION_HUB_WINDOW_HOURS,
  TimeZone,
} from '../src/constants.js';
import { prisma } from '../src/prisma.js';
import { sendToTokens } from '../src/utils/notifications.js';
import { getNotificationSlot } from '../src/utils/time.js';

const PUSH_NOTIFICATION_TITLE = 'Eatery';
const HUB_NOTIFICATION_TITLE = '';

function formatPlaces(places: string[]): string {
  if (places.length <= 1) {
    return places[0] ?? '';
  }
  if (places.length === 2) {
    return `${places[0]} and ${places[1]}`;
  }
  if (places.length === 3) {
    return `${places[0]}, ${places[1]}, and ${places[2]}`;
  }
  return `${places[0]} and ${places.length - 1} others`;
}

function formatAlertBody(
  food: string,
  places: string[],
  servedMinute: Date,
): string {
  const time = formatInTimeZone(servedMinute, TimeZone.EASTERN, 'h:mm a');
  return `**${food}** is being served at ${formatPlaces(places)} at ${time}!`;
}

/**
 * Returns a map keyed by item name. The value is the notification body for that
 * item, listing each eatery that serves it during this minute once.
 */
function buildFoodAlerts(
  events: {
    eatery: { name: string };
    menu: { items: { name: string }[] }[];
  }[],
  servedMinute: Date,
): Map<string, string> {
  const placesByItem = new Map<string, string[]>();
  const seenPlaces = new Map<string, Set<string>>();

  for (const event of events) {
    const place = event.eatery.name;
    for (const category of event.menu) {
      for (const item of category.items) {
        let places = placesByItem.get(item.name);
        let seen = seenPlaces.get(item.name);
        if (!places || !seen) {
          places = [];
          seen = new Set();
          placesByItem.set(item.name, places);
          seenPlaces.set(item.name, seen);
        }
        if (!seen.has(place)) {
          seen.add(place);
          places.push(place);
        }
      }
    }
  }

  const alerts = new Map<string, string>();
  for (const [itemName, places] of placesByItem) {
    alerts.set(itemName, formatAlertBody(itemName, places, servedMinute));
  }
  return alerts;
}

type PendingAlert = {
  userId: number;
  body: string;
  tokens: string[];
  pushEnabled: boolean;
};

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

function pendingAlertsForUsers(
  users: {
    id: number;
    favoritedItemNames: string[];
    fcmTokens: { token: string }[];
    settings: { favoriteItemPushNotifications: boolean } | null;
  }[],
  foods: Map<string, string>,
): PendingAlert[] {
  const pending: PendingAlert[] = [];

  for (const user of users) {
    const pushEnabled =
      user.settings?.favoriteItemPushNotifications ??
      DEFAULT_SETTINGS.favoriteItemPushNotifications;
    const tokens = user.fcmTokens.map((token) => token.token);
    const seen = new Set<string>();

    for (const name of user.favoritedItemNames) {
      if (seen.has(name)) {
        continue;
      }
      const body = foods.get(name);
      if (!body) {
        continue;
      }
      seen.add(name);
      pending.push({
        userId: user.id,
        body,
        tokens,
        pushEnabled,
      });
    }
  }

  return pending;
}

export async function main() {
  await pruneOldNotifications();

  const servedMinute = getNotificationSlot();

  const events = await prisma.event.findMany({
    where: {
      startTimestamp: servedMinute,
    },
    select: {
      eatery: { select: { name: true } },
      menu: { select: { items: { select: { name: true } } } },
    },
  });

  const foods = buildFoodAlerts(events, servedMinute);
  const itemNames = Array.from(foods.keys());

  if (itemNames.length === 0) {
    return;
  }

  const users = await prisma.user.findMany({
    where: {
      favoritedItemNames: { hasSome: itemNames },
    },
    select: {
      id: true,
      favoritedItemNames: true,
      fcmTokens: { select: { token: true } },
      settings: { select: { favoriteItemPushNotifications: true } },
    },
  });

  const pending = pendingAlertsForUsers(users, foods);

  if (pending.length > 0) {
    await prisma.notification.createMany({
      data: pending.map((alert) => ({
        userId: alert.userId,
        title: HUB_NOTIFICATION_TITLE,
        body: alert.body,
      })),
    });
  }

  for (const alert of pending) {
    if (!alert.pushEnabled) {
      continue;
    }
    try {
      await sendToTokens(
        alert.tokens,
        PUSH_NOTIFICATION_TITLE,
        alert.body.replaceAll('**', ''),
      );
    } catch (e) {
      console.error(`Failed to send notification for user ${alert.userId}:`, e);
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
  const cronExpression =
    process.env.NOTI_CRON_SCHEDULE || NOTIFICATION_CRON_SCHEDULE;

  console.log('[Notifications] Initializing scheduler...');
  console.log(`[Notifications] Schedule: ${cronExpression}`);

  const task = cron.schedule(cronExpression, runNotificationsSafely, {
    timezone: TimeZone.EASTERN,
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
      console.error('Error during notifications:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
