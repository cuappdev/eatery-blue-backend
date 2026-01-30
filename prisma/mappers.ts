import {
  CampusArea,
  EateryType,
  EventType,
  PaymentMethod,
} from '@prisma/client';

import {
  EATERY_IMAGES_BASE_URL,
  WEEKDAY_TO_DAY_OF_WEEK,
  Weekday,
} from '../src/constants.js';
import type {
  RawCampusArea,
  RawEateryType,
  RawPayMethod,
} from './scraperTypes.js';

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
    case 'Late Night':
      return EventType.LATE_NIGHT;
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
      return EventType.PANTS; // pants
    case 'General':
      return EventType.GENERAL;
    case 'Free Food':
      return EventType.GENERAL;
    default:
      throw new Error(`Unknown event type: ${eventDescription}`);
  }
}

// Mapping from cornellId to image filename (relative to base URL)
const CORNELL_ID_TO_IMAGE_FILENAME: Record<number, string> = {
  31: '104-West.jpg',
  7: 'Amit-Bhatia-Libe-Cafe.jpg',
  8: 'Atrium-Cafe.jpg',
  1: 'Bear-Necessities.jpg',
  25: 'Becker-House-Dining.jpg',
  10: 'Big-Red-Barn.jpg',
  11: 'Bug-Stop-Bagels.jpg',
  12: 'Cafe-Jennie.jpg',
  26: 'Cook-House-Dining.jpg',
  14: 'Cornell-Dairy-Bar.jpg',
  41: 'Crossings-Cafe.jpg',
  32: 'frannys.jpg',
  16: 'Goldies-Cafe.jpg',
  15: 'Green-Dragon.jpg',
  24: 'Hot-Dog-Cart.jpg',
  34: 'icecreamcart.jpg',
  27: 'Jansens-Dining.jpg',
  28: 'Jansens-Market.jpg',
  29: 'Keeton-House-Dining.jpg',
  42: 'Mann-Cafe.jpg',
  18: 'Marthas-Cafe.jpg',
  19: 'Mattins-Cafe.jpg',
  33: 'mccormicks.jpg',
  3: 'North-Star.jpg',
  20: 'Okenshields.jpg',
  4: 'Risley-Dining.jpg',
  5: 'Risley-Dining.jpg',
  30: 'Rose-House-Dining.jpg',
  21: 'Rustys.jpg',
  13: 'StraightMarket.jpg',
  23: 'Trillium.jpg',
  43: 'Morrison-Dining.jpg',
  44: 'novicks-cafe.jpg',
  45: 'vets-cafe.jpg',
  // Static eateries
  [-33]: 'Terrace.jpg',
  [-34]: 'Macs-Cafe.jpg',
  [-35]: 'Zeus.jpg',
  [-36]: 'Gimme-Coffee.jpg',
  [-37]: 'Louies-Lunch.jpg',
  [-38]: 'Anabels-Grocery.jpg',
  [-46]: 'Freege.jpg',
};

export function mapImageUrl(cornellId: number): string {
  const imageFilename = CORNELL_ID_TO_IMAGE_FILENAME[cornellId];
  if (!imageFilename) {
    throw new Error(`No image URL mapping found for cornellId: ${cornellId}`);
  }
  return `${EATERY_IMAGES_BASE_URL}${imageFilename}`;
}

export function weekdayToDayOfWeek(weekday: string): number {
  if (Object.values(Weekday).includes(weekday as Weekday)) {
    return WEEKDAY_TO_DAY_OF_WEEK[weekday as Weekday];
  }
  // default to Monday if not found
  return WEEKDAY_TO_DAY_OF_WEEK[Weekday.MONDAY];
}

export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours: hours ?? 0, minutes: minutes ?? 0 };
}

export function createWeeklyDate(
  weekday: string,
  timeStr: string,
  baseDate: Date = new Date(),
): Date {
  const dayOfWeek = weekdayToDayOfWeek(weekday);
  const { hours, minutes } = parseTime(timeStr);
  const date = new Date(baseDate);
  const currentDay = date.getDay();
  const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;

  date.setDate(date.getDate() + daysUntilTarget);
  date.setHours(hours, minutes, 0, 0);

  return date;
}
