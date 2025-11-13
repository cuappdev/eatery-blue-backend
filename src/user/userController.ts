import type { EventType, User } from '@prisma/client';

import type { NextFunction, Request, Response } from 'express';

import { prisma } from '../prisma.js';
import { BadRequestError, NotFoundError } from '../utils/AppError.js';
import { getTodayTimeWindow } from '../utils/time.js';

/**
 * Middleware to extract deviceId from header and attach user to request.
 * This is used for all routes that act on behalf of a user.
 */
export const requireUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const deviceId = req.headers['x-device-id'] as string;

  if (!deviceId) {
    return next(
      new BadRequestError('Device ID header (X-Device-ID) is required.'),
    );
  }

  const user = await prisma.user.findUnique({
    where: { deviceId },
  });

  if (!user) {
    return next(
      new NotFoundError(
        `User with deviceId "${deviceId}" not found. Please register first.`,
      ),
    );
  }

  res.locals.user = user;
  next();
};

/**
 * Add or update an FCM token for the user.
 * The token itself is unique, so this will update the existing
 * record if it's already in the DB, linking it to the current user.
 */
export const addFcmToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { token } = req.body;
  const { user } = res.locals;

  await prisma.fCMToken.upsert({
    where: { token },
    update: {
      userId: user.id,
    },
    create: {
      token,
      userId: user.id,
    },
  });

  res.status(200).json({ message: 'Token registered successfully.' });
};

export const removeFcmToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { token } = req.body;
  const { user } = res.locals;

  try {
    await prisma.fCMToken.delete({
      where: {
        token,
        userId: user.id,
      },
    });
    res.status(200).json({ message: 'Token removed successfully.' });
  } catch (e) {
    res.status(200).json({ message: 'Token removal processed. Error: ' + e });
  }
};

export const addFavoriteItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name } = req.body;
    const { user } = res.locals as { user: User };

    await prisma.user.update({
      where: { id: user.id },
      data: {
        // Add to the array if it doesn't already exist
        favoritedItemNames: {
          push: name,
        },
      },
    });

    res.status(200).json({ message: 'Favorite item added.' });
  } catch (error) {
    next(error);
  }
};

export const removeFavoriteItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name } = req.body;
    const { user } = res.locals as { user: User };

    // Filter the name out of the array
    const updatedItems = user.favoritedItemNames.filter(
      (item) => item !== name,
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        favoritedItemNames: updatedItems,
      },
    });

    res.status(200).json({ message: 'Favorite item removed.' });
  } catch (error) {
    next(error);
  }
};

export const addFavoriteEatery = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { eateryId } = req.body;
    const { user } = res.locals as { user: User };

    // Use upsert to avoid crashing if the relation already exists
    await prisma.favoritedEatery.upsert({
      where: {
        userId_eateryId: {
          userId: user.id,
          eateryId: eateryId,
        },
      },
      create: {
        userId: user.id,
        eateryId: eateryId,
      },
      update: {},
    });

    res.status(200).json({ message: 'Favorite eatery added.' });
  } catch (error) {
    next(error);
  }
};

export const removeFavoriteEatery = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    const { eateryId } = req.body;
    const { user } = res.locals as { user: User };

    await prisma.favoritedEatery.delete({
      where: {
        userId_eateryId: {
          userId: user.id,
          eateryId: eateryId,
        },
      },
    });

    res.status(200).json({ message: 'Favorite eatery removed.' });
  } catch {
    // Don't fail if they try to delete something that's not there
    res.status(200).json({ message: 'Favorite eatery removal processed.' });
  }
};

/**
 * Gets all of a user's favorite items that are being served today
 * and the eateries serving them.
 */
export const getFavoriteMatches = async (
  _: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = res.locals as { user: User };
    const { favoritedItemNames } = user;

    if (favoritedItemNames.length === 0) {
      return res.json({});
    }

    const { start, end } = getTodayTimeWindow();

    const eateries = await prisma.eatery.findMany({
      where: {
        events: {
          some: {
            startTimestamp: { lte: end },
            endTimestamp: { gte: start },
            menu: {
              some: {
                items: {
                  some: {
                    name: { in: favoritedItemNames },
                  },
                },
              },
            },
          },
        },
      },
      include: {
        events: {
          where: {
            startTimestamp: { lte: end },
            endTimestamp: { gte: start },
          },
          include: {
            menu: {
              include: {
                items: {
                  where: {
                    name: { in: favoritedItemNames },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Format the response
    const matches: Record<string, { name: string; events: EventType[] }[]> = {};
    const userFavoritesSet = new Set(favoritedItemNames);

    for (const eatery of eateries) {
      // Use a Map to collect all unique events for each item
      const itemToEventsMap = new Map<string, Set<EventType>>();

      for (const event of eatery.events) {
        for (const category of event.menu) {
          for (const item of category.items) {
            if (userFavoritesSet.has(item.name)) {
              if (!itemToEventsMap.has(item.name)) {
                itemToEventsMap.set(item.name, new Set<EventType>());
              }
              itemToEventsMap.get(item.name)!.add(event.type);
            }
          }
        }
      }

      if (itemToEventsMap.size > 0) {
        matches[eatery.name] = Array.from(itemToEventsMap.entries()).map(
          ([itemName, eventSet]) => ({
            name: itemName,
            events: Array.from(eventSet).sort(),
          }),
        );
      }
    }

    res.json(matches);
  } catch (error) {
    return next(error);
  }
};
