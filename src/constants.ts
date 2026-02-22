export const EATERY_IMAGES_BASE_URL =
  'https://appdev-upload.nyc3.digitaloceanspaces.com/eatery-images/';

export const DEFAULT_IMAGE_URL =
  'https://images-prod.healthline.com/hlcmsresource/images/AN_images/health-benefits-of-apples-1296x728-feature.jpg';

/** How many hours ahead to look for events when sending notifications */
export const NOTIFICATION_LOOKAHEAD_HOURS = 7;
export const ITUNES_LOOKUP_URL =
  'https://itunes.apple.com/lookup?bundleId=org.cuappdev.eatery';

export enum Weekday {
  SUNDAY = 'Sunday',
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
}

export const WEEKDAY_TO_DAY_OF_WEEK: Record<Weekday, number> = {
  [Weekday.SUNDAY]: 0,
  [Weekday.MONDAY]: 1,
  [Weekday.TUESDAY]: 2,
  [Weekday.WEDNESDAY]: 3,
  [Weekday.THURSDAY]: 4,
  [Weekday.FRIDAY]: 5,
  [Weekday.SATURDAY]: 6,
};
