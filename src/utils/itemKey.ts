/** Key for an item at a specific eatery (matches User liked/disliked arrays) */
export const makeItemKey = (itemName: string, cornellId: number): string =>
  `${itemName}|${cornellId}`;
