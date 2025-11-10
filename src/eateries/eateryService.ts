import type { Eatery } from '@prisma/client';

import { getAllEateriesData } from '../utils/cache.js';

export class EateryService {
  static async getAllEateries() {
    const allData = getAllEateriesData(); // or <Eatery[]>
    return allData.map((eatery: Eatery) => ({
      id: eatery.id,
      name: eatery.name,
      location: eatery.location,
      // Add more needed fields here
    }));
  }

  static async getEateryById(id: number) {
    const allData = getAllEateriesData();
    const eatery = allData.find((eatery) => eatery.id === id);
    if (!eatery) {
      throw new Error(`Eatery with id ${id} not found.`);
    }
    return eatery;
  }
}
