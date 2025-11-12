import { CampusArea, PaymentMethods, EateryType, EventType } from '@prisma/client';

  export function mapCampusArea(area: {descrshort: string}): CampusArea {
    switch (area.descrshort) {
      case "West": return CampusArea.WEST;
      case "North": return CampusArea.NORTH;
      case "Central": return CampusArea.CENTRAL;
      case "Collegetown": return CampusArea.COLLEGETOWN;
      default: return CampusArea.NONE;
    }
  }

  export function mapPaymentMethods(methods: string[]): PaymentMethods[] {
    return methods.map(method => {
      switch (method) {
        case "Meal Plan - Swipe": return PaymentMethods.MEAL_SWIPE;
        case "Cash": return PaymentMethods.CASH;
        case "Major Credit Cards": return PaymentMethods.CARD;
        case "Meal Plan - Debit": return PaymentMethods.BRB;
        // skip unknown payment methods
        default: return undefined;
      }
    }).filter(method => method !== undefined);
  }

  export function mapEateryType(types: string[]): EateryType[] {
    return types.map(type => {
      switch (type) {
        case "Dining Room": return EateryType.DINING_ROOM;
        case "Cafe": return EateryType.CAFE;
        case "Coffee Shop": return EateryType.COFFEE_SHOP;
        case "Food Court": return EateryType.FOOD_COURT;
        case "Convenience Store": return EateryType.CONVENIENCE_STORE;
        case "Cart": return EateryType.CART;
        default: throw new Error(`Unknown eatery type: ${type}`);
      }
    });
  }

  export function mapEventType(eventDescription: string): EventType {
    switch (eventDescription) {
      case "Brunch": return EventType.BRUNCH;
      case "Breakfast": return EventType.BREAKFAST;
      case "Lunch": return EventType.LUNCH;
      case "Dinner": return EventType.DINNER;
      case "Cafe": return EventType.CAFE;
      case "Pants": return EventType.PANTS;
      default: return EventType.GENERAL;
    }
  }
