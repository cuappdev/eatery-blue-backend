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

export const getAllEateries = async (days: number = 0) => {
  const cachedEateries = await getCachedEateries();

  // Calculate date range for filtering events
  // days=0 means today, days=1 means tomorrow, etc.
  const now = new Date();
  const targetDay = new Date(now);
  targetDay.setDate(now.getDate() + days);

  const startOfDay = new Date(targetDay);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDay);
  endOfDay.setHours(23, 59, 59, 999);

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
