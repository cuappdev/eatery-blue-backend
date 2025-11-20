import type { Event } from '@prisma/client';

import { NotFoundError } from '../utils/AppError.js';
import { getAllEateriesData, refreshCacheFromDB } from '../utils/cache.js';
import type { EateryWithEvents } from '../utils/cache.js';

async function getCachedEateries(): Promise<EateryWithEvents[]> {
  try {
    return getAllEateriesData();
  } catch {
    // If cache is cold (should never happen), populate it from the database
    await refreshCacheFromDB();
    return getAllEateriesData();
  }
}

export const getAllEateries = async (days?: number) => {
  const cachedEateries = await getCachedEateries();

  // If no days parameter provided, return all eateries with all events
  if (days === undefined) {
    return cachedEateries;
  }

  // Calculate date range for filtering events using UTC to match event timestamps
  // days=0 means today, days=1 means tomorrow, days=2 means day after tomorrow, etc.
  const now = new Date();

  // Add days by adding milliseconds (avoids timezone issues)
  const msPerDay = 24 * 60 * 60 * 1000;
  const targetTimestamp = now.getTime() + days * msPerDay;
  const targetDate = new Date(targetTimestamp);

  // Set to start of day in UTC
  const startOfDay = new Date(
    Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );

  // Set to end of day in UTC
  const endOfDay = new Date(
    Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );

  // Filter events to only include those on the specified day
  const filteredEateries = cachedEateries.map((eatery) => ({
    ...eatery,
    events: eatery.events.filter((event: Event) => {
      const eventStart = new Date(event.startTimestamp);
      const eventEnd = new Date(event.endTimestamp);

      // Include event if it overlaps with the target day
      return eventStart <= endOfDay && eventEnd >= startOfDay;
    }),
  }));

  return filteredEateries;
};

export const getEateryById = async (eateryId: number) => {
  const cachedEateries = await getCachedEateries();
  const eatery = cachedEateries.find((e) => e.id === eateryId);

  if (!eatery) {
    throw new NotFoundError(`Eatery with ID ${eateryId} not found`);
  }

  return eatery;
};
