import { addMinutes, endOfDay, startOfDay } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

import { NOTIFICATION_LEAD_MINUTES, TimeZone } from '../constants.js';

/**
 * Gets the start and end of the current day in a specific timezone.
 */
export function getTodayTimeWindow(timeZone: string = 'America/New_York') {
  const zonedNow = new Date(new Date().toLocaleString('en-US', { timeZone }));

  const start = startOfDay(zonedNow);
  const end = endOfDay(zonedNow);

  return { start, end };
}

/**
 * Gets the event start time to alert for at a given time. Ignores the current seconds.
 */
export function getNotificationSlot(now: Date = new Date()): Date {
  const target = addMinutes(now, NOTIFICATION_LEAD_MINUTES);
  const minuteKey = formatInTimeZone(
    target,
    TimeZone.EASTERN,
    "yyyy-MM-dd'T'HH:mm:00",
  );
  return fromZonedTime(minuteKey, TimeZone.EASTERN);
}
