import { addHours, endOfDay, getUnixTime, startOfDay } from 'date-fns';

import { NOTIFICATION_LOOKAHEAD_HOURS } from '../constants.js';

/**
 * Gets the start and end of the current day in a specific timezone.
 */
export function getTodayTimeWindow(timeZone: string = 'America/New_York') {
  const zonedNow = new Date(new Date().toLocaleString('en-US', { timeZone }));

  const start = startOfDay(zonedNow);
  const end = endOfDay(zonedNow);

  return { start, end };
}

export function getQueryTimeWindow(): {
  windowStartUnix: number;
  windowEndUnix: number;
} {
  const timeZone = 'America/New_York';

  const zonedNow = new Date(new Date().toLocaleString('en-US', { timeZone }));
  const start = zonedNow;
  const end = addHours(start, NOTIFICATION_LOOKAHEAD_HOURS);

  return {
    windowStartUnix: getUnixTime(start),
    windowEndUnix: getUnixTime(end),
  };
}
