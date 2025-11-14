import cron from 'node-cron';

import { main as runScraper } from '../../prisma/scraper.js';

let isRunning = false;

export async function runScraperSafely() {
  if (isRunning) {
    console.log(
      '[Scheduler] Scraper is already running, skipping this execution',
    );
    return;
  }

  isRunning = true;
  const startTime = Date.now();
  console.log(
    `[Scheduler] Starting scheduled scraper run at ${new Date().toISOString()}`,
  );

  try {
    await runScraper();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[Scheduler] Scraper completed successfully in ${duration}s`);
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`[Scheduler] Scraper failed after ${duration}s:`, error);
  } finally {
    isRunning = false;
  }
}

export function startScraperScheduler() {
  // Run at 7 AM and 7 PM every day (using 24-hour format)
  // Cron format: minute hour day month day-of-week
  // '0 7,19 * * *' means: at minute 0 of hours 7 and 19, every day
  // For testing: use '* * * * *' to run every minute, or '*/5 * * * *' for every 5 minutes
  const cronExpression = process.env.SCRAPER_CRON_SCHEDULE || '0 7,19 * * *';

  console.log('[Scheduler] Initializing scraper scheduler...');
  console.log('[Scheduler] Schedule: Daily at 7:00 AM and 7:00 PM');

  // Schedule the cron job
  const task = cron.schedule(cronExpression, runScraperSafely, {
    timezone: 'America/New_York', // Adjust timezone as needed
  });

  console.log('[Scheduler] Scraper scheduler started successfully');

  return task;
}
