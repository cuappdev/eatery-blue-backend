import escapeHtml from 'escape-html';

import type { Eatery } from '@prisma/client';

import { getAllEateriesData } from '../utils/cache.js';

export class EateryService {
  static getAllEateries() {
    const allData = getAllEateriesData();
    return allData.map((eatery: Eatery) => ({
      id: eatery.id,
      name:
        typeof eatery.name === 'string' ? escapeHtml(eatery.name) : eatery.name,
      location:
        typeof eatery.location === 'string'
          ? escapeHtml(eatery.location)
          : eatery.location,
      // Add/escape other string fields here if needed later
    }));
  }

  static getEateryById(id: number) {
    const allData = getAllEateriesData();
    const eatery = allData.find((e) => e.id === id);
    if (!eatery) {
      const err: any = new Error(`Eatery with id ${id} not found.`);
      err.status = 404;
      throw err;
    }
    return eatery;
  }
}
