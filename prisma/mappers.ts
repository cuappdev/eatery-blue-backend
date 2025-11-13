import { RawCampusArea, RawEateryType, RawPayMethod } from './scraperTypes';

import {
  CampusArea,
  EateryType,
  EventType,
  PaymentMethod,
} from '@prisma/client';

export function mapCampusArea(area: RawCampusArea): CampusArea {
  // Only consider descrshort for mapping
  switch (area.descrshort) {
    case 'East':
      return CampusArea.EAST;
    case 'West':
      return CampusArea.WEST;
    case 'North':
      return CampusArea.NORTH;
    case 'Central':
      return CampusArea.CENTRAL;
    case 'Collegetown':
      return CampusArea.COLLEGETOWN;
    case 'South':
      return CampusArea.SOUTH;
    default:
      throw new Error(`Unknown campus area: ${area.descrshort}`);
  }
}

export function mapPaymentMethod(method: RawPayMethod): PaymentMethod {
  // Only consider descrshort for mapping
  switch (method.descrshort) {
    case 'Meal Plan - Swipe':
      return PaymentMethod.MEAL_SWIPE;
    case 'Meal Plan - Debit':
    case 'Cornell Card':
      return PaymentMethod.BRB;
    case 'Major Credit Cards':
    case 'Mobile Payments':
      return PaymentMethod.CARD;
    case 'Cash':
      return PaymentMethod.CASH;
    case 'Free':
      return PaymentMethod.FREE;
    default:
      throw new Error(`Unknown payment method: ${method.descrshort}`);
  }
}

export function mapEateryType(type: RawEateryType): EateryType {
  // Only consider descr for mapping
  switch (type.descr) {
    case 'Dining Room':
      return EateryType.DINING_ROOM;
    case 'Cafe':
        return EateryType.CAFE;
    case 'Coffee Shop':
      return EateryType.COFFEE_SHOP;
    case 'Food Court':
      return EateryType.FOOD_COURT;
    case 'Convenience Store':
      return EateryType.CONVENIENCE_STORE;
    case 'Cart':
      return EateryType.CART;
    case 'General':
      return EateryType.GENERAL;
    default:
      throw new Error(`Unknown eatery type: ${type.descr}`);
    }
}

export function mapEventType(eventDescription: string): EventType {
  switch (eventDescription) {
    case 'Available All Day':
      return EventType.AVAILABLE_ALL_DAY;
    case 'Breakfast':
      return EventType.BREAKFAST;
    case 'Brunch':
      return EventType.BRUNCH;
    case 'Dinner':
      return EventType.DINNER;
    case '':
      // Could be empty string in the case of general events (e.g. Amit Bhatia Libe Cafe since it serves all day)
      return EventType.EMPTY;
    case 'Late Lunch':
      return EventType.LATE_LUNCH;
    case 'Lunch':
      return EventType.LUNCH;
    case 'Open':
      return EventType.OPEN;
    case 'Pants':
      return EventType.PANTS;
    case 'General':
      return EventType.GENERAL;
    case 'Free Food':
      return EventType.GENERAL;
    default:
      throw new Error(`Unknown event type: ${eventDescription}`);
  }
}

// Mapping from cornellId to Digital Ocean Spaces image URL
const CORNELL_ID_TO_IMAGE_URL: Record<number, string> = {
  31: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/104-West.jpg',
  7: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Amit-Bhatia-Libe-Cafe.jpg',
  8: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Atrium-Cafe.jpg',
  1: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Bear-Necessities.jpg',
  25: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Becker-House-Dining.jpg',
  10: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Big-Red-Barn.jpg',
  11: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Bug-Stop-Bagels.jpg',
  12: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Cafe-Jennie.jpg',
  26: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Cook-House-Dining.jpg',
  14: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Cornell-Dairy-Bar.jpg',
  41: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Crossings-Cafe.jpg',
  32: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/frannys.jpg',
  16: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Goldies-Cafe.jpg',
  15: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Green-Dragon.jpg',
  24: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Hot-Dog-Cart.jpg',
  34: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/icecreamcart.jpg',
  27: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Jansens-Dining.jpg',
  28: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Jansens-Market.jpg',
  29: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Keeton-House-Dining.jpg',
  42: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Mann-Cafe.jpg',
  18: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Marthas-Cafe.jpg',
  19: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Mattins-Cafe.jpg',
  33: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/mccormicks.jpg',
  3: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/North-Star.jpg',
  20: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Okenshields.jpg',
  4: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Risley-Dining.jpg',
  5: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Risley-Dining.jpg', // RPCC uses same image
  30: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Rose-House-Dining.jpg',
  21: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Rustys.jpg',
  13: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/StraightMarket.jpg',
  23: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Trillium.jpg',
  43: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Morrison-Dining.jpg',
  44: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/novicks-cafe.jpg',
  45: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/vets-cafe.jpg',
  // Static eateries (negative IDs)
  [-33]: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Terrace.jpg',
  [-34]: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Macs-Cafe.jpg',
  [-35]: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Zeus.jpg',
  [-36]: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Gimme-Coffee.jpg',
  [-37]: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Louies-Lunch.jpg',
  [-38]: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Anabels-Grocery.jpg',
  [-46]: 'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/Freege.jpg',
};

export function mapImageUrl(cornellId: number): string {
  const imageUrl = CORNELL_ID_TO_IMAGE_URL[cornellId];
  if (!imageUrl) {
    throw new Error(`No image URL mapping found for cornellId: ${cornellId}`);
  }
  return imageUrl;
}

export function weekdayToDayOfWeek(weekday: string): number {
  const weekdays: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  return weekdays[weekday] ?? 1; // Default to Monday if not found
}

export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours: hours ?? 0, minutes: minutes ?? 0 };
}

/**
 * Create a date for a specific weekday and time (for recurring weekly events)
 */
export function createWeeklyDate(weekday: string, timeStr: string, baseDate: Date = new Date()): Date {
  const dayOfWeek = weekdayToDayOfWeek(weekday);
  const { hours, minutes } = parseTime(timeStr);
  
  const date = new Date(baseDate);
  const currentDay = date.getDay();
  const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
  
  date.setDate(date.getDate() + daysUntilTarget);
  date.setHours(hours, minutes, 0, 0);
  
  return date;
}