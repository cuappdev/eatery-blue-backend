import { addHours, endOfDay, getUnixTime, startOfDay } from 'date-fns';

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

  // How many hours ahead to look for events
  const LOOKAHEAD_HOURS = 7;

  const zonedNow = new Date(new Date().toLocaleString('en-US', { timeZone }));
  const start = zonedNow;
  const end = addHours(start, LOOKAHEAD_HOURS);

  return {
    windowStartUnix: getUnixTime(start),
    windowEndUnix: getUnixTime(end),
  };
}
