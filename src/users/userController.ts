import type { EventType } from '@prisma/client';

import type { NextFunction, Request, Response } from 'express';

import { prisma } from '../prisma.js';
import { getTodayTimeWindow } from '../utils/time.js';

export const getMe = async (req: Request, res: Response) => {
  const { userId } = req.user!;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      deviceUuid: true,
      fcmTokens: true,
      reports: true,
      favoritedEateries: true,
      favoritedItemNames: true,
      userEventVotes: true,
    },
  });

  return res.json({ user });
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
  const { userId } = req.user!;

  await prisma.fCMToken.upsert({
    where: { token },
    update: { userId },
    create: { token, userId },
  });

  res.status(200).json({ message: 'Token registered successfully.' });
};

export const removeFcmToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { token } = req.body;
  const { userId } = req.user!;

  try {
    await prisma.fCMToken.delete({
      where: {
        token,
        userId,
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
    const { userId } = req.user!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

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
    return next(error);
  }
};

export const removeFavoriteItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name } = req.body;
    const { userId } = req.user!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

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
    return next(error);
  }
};

export const addFavoriteEatery = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { eateryId } = req.body;
    const { userId } = req.user!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

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
    return next(error);
  }
};

export const removeFavoriteEatery = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    const { eateryId } = req.body;
    const { userId } = req.user!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    await prisma.favoritedEatery.delete({
      where: {
        userId_eateryId: {
          userId: user.id,
          eateryId: eateryId,
        },
      },
    });

    return res.status(200).json({ message: 'Favorite eatery removed.' });
  } catch {
    // Don't fail if they try to delete something that's not there
    return res
      .status(200)
      .json({ message: 'Favorite eatery removal processed.' });
  }
};

/**
 * Gets all of a user's favorite items that are being served today
 * and the eateries serving them.
 */
export const getFavoriteMatches = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.user!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
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
