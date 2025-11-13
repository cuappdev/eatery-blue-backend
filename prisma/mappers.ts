import {
  CampusArea,
  EateryType,
  EventType,
  PaymentMethod,
} from '@prisma/client';

export function mapCampusArea(area: { descr: string, descrshort: string }): CampusArea {
  // Only consider descrshort for mapping
  switch (area.descrshort) {
    case 'West':
      return CampusArea.WEST;
    case 'North':
      return CampusArea.NORTH;
    case 'Central':
      return CampusArea.CENTRAL;
    case 'Collegetown':
      return CampusArea.COLLEGETOWN;
    default:
      throw new Error(`Unknown campus area: ${area.descrshort}`);
  }
}

export function mapPaymentMethod(method: { descr: string, descrshort: string}): PaymentMethod {
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
    default:
      throw new Error(`Unknown payment method: ${method.descrshort}`);
  }
}

export function mapEateryType(type: { descr: string, descrshort: string }): EateryType {
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
    default:
      throw new Error(`Unknown eatery type: ${type.descr}`);
    }
}

export function mapEventType(eventDescription: string): EventType {
  switch (eventDescription) {
    case 'Brunch':
      return EventType.BRUNCH;
    case 'Breakfast':
      return EventType.BREAKFAST;
    case 'Lunch':
      return EventType.LUNCH;
    case 'Dinner':
      return EventType.DINNER;
    case 'Cafe':
      return EventType.CAFE;
    case 'Pants':
      return EventType.PANTS;
    case '':
      // Could be empty string in the case of general events (e.g. Amit Bhatia Libe Cafe since it serves all day)
      return EventType.GENERAL;
    default:
      throw new Error(`Unknown event type: ${eventDescription}`);
  }
}
