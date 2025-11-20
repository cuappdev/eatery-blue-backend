import type { Event } from '@prisma/client';

import { prisma } from '../prisma.js';
import { NotFoundError } from '../utils/AppError.js';
import { getAllEateriesData, refreshCacheFromDB } from '../utils/cache.js';
import type { EateryWithEvents } from '../utils/cache.js';

export const getAllEateries = async (days: number = 0) => {
  // Calculate date range for filtering events
  // days=0 means today, days=1 means tomorrow, etc.
  const now = new Date();
  const targetDay = new Date(now);
  targetDay.setDate(now.getDate() + days);

  const startOfDay = new Date(targetDay);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDay);
  endOfDay.setHours(23, 59, 59, 999);

  // Try to get from cache first
  try {
    const cachedEateries = getAllEateriesData();

    // Filter events to only include those on the specified day
    const filteredEateries = filterEateries(
      cachedEateries,
      startOfDay,
      endOfDay,
    );

    return filteredEateries;
  } catch {
    // If cache is cold (should never happen), fall back to database
    refreshCacheFromDB();
    const cachedEateries = getAllEateriesData();

    // Filter events to only include those on the specified day
    const filteredEateries = filterEateries(
      cachedEateries,
      startOfDay,
      endOfDay,
    );

    return filteredEateries;
  }
};

export const getEateryById = async (eateryId: number) => {
  // Try to get eatery from cache first
  try {
    const cachedEateries = getAllEateriesData();
    const eatery = cachedEateries.find((e) => e.id === eateryId);

    if (!eatery) {
      throw new NotFoundError('Eatery not found');
    }

    return eatery;
  } catch (error) {
    // If cache is cold or eatery not found in cache, fall back to database
    if (error instanceof NotFoundError) {
      throw error;
    }
    refreshCacheFromDB();
    const cachedEateries = getAllEateriesData();
    const eatery = cachedEateries.find((e) => e.id === eateryId);

    if (eatery) {
      return eatery;
    }

    // As a last resort, fetch directly from the database
    const fromDB = await prisma.eatery.findUnique({
      where: { id: eateryId },
      include: {
        events: {
          include: {
            menu: {
              include: {
                items: {
                  include: {
                    dietaryPreferences: true,
                    allergens: true,
                  },
                },
              },
            },
            userEventVotes: true,
          },
          orderBy: {
            startTimestamp: 'asc',
          },
        },
      },
    });

    if (!fromDB) {
      throw new NotFoundError('Eatery not in DB');
    }

    return fromDB;
  }
};

function filterEateries(
  cachedEateries: EateryWithEvents[],
  startOfDay: Date,
  endOfDay: Date,
) {
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
}
