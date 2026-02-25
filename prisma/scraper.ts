import 'dotenv/config';
import { readFileSync } from 'fs';
import cron from 'node-cron';
import { join } from 'path';

import { PrismaClient } from '@prisma/client';
import {
  type CampusArea,
  EateryType,
  type PaymentMethod,
} from '@prisma/client';

import { DEFAULT_IMAGE_URL } from '../src/constants.js';
import {
  createWeeklyDate,
  mapCampusArea,
  mapEateryType,
  mapEventType,
  mapImageUrl,
  mapPaymentMethod,
} from './mappers.js';
import type {
  RawDiningItem,
  RawEatery,
  RawOperatingHourEventMenuCategory,
  RawScrapedData,
  RawStaticEatery,
} from './scraperTypes.js';

const prisma = new PrismaClient();

async function getDiningData(): Promise<RawScrapedData> {
  const apiUrl = process.env.CORNELL_DINING_API_URL;
  if (!apiUrl) {
    throw new Error('CORNELL_DINING_API_URL environment variable is not set');
  }

  const response = await fetch(apiUrl, {
    signal: AbortSignal.timeout(30000), // 30 second timeout
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch dining data: HTTP ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as RawScrapedData;

  if (!data?.data?.eateries) {
    throw new Error('Invalid response format from Cornell Dining API');
  }

  return data;
}

function loadStaticEateries(): RawStaticEatery[] {
  try {
    const staticEateriesPath = join(
      process.cwd(),
      'prisma',
      'staticEateries.json',
    );
    const fileContent = readFileSync(staticEateriesPath, 'utf-8');
    const data = JSON.parse(fileContent);

    const eateries = Array.isArray(data) ? data : data.eateries || [];
    return eateries;
  } catch (error) {
    if ((error as { code?: string }).code === 'ENOENT') {
      console.log('No static eateries file found, skipping...');
      return [];
    }
    throw error;
  }
}

async function fetchFreedgeDiningItems(): Promise<RawDiningItem[]> {
  const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
  const FREEDGE_SHEET_ID = process.env.FREEDGE_SHEET_ID;
  const FREEDGE_APPROVED_EMAILS = process.env.FREEDGE_APPROVED_EMAILS;

  if (!GOOGLE_SHEETS_API_KEY) {
    console.log('GOOGLE_SHEETS_API_KEY not set, skipping freedge update');
    return [];
  }
  if (!FREEDGE_SHEET_ID) {
    console.log('FREEDGE_SHEET_ID not set, skipping freedge update');
    return [];
  }
  if (!FREEDGE_APPROVED_EMAILS) {
    console.log('FREEDGE_APPROVED_EMAILS not set, skipping freedge update');
    return [];
  }

  const approvedEmails = FREEDGE_APPROVED_EMAILS.split(',').map((email) =>
    email.trim(),
  );

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${FREEDGE_SHEET_ID}/values/A2:M?key=${GOOGLE_SHEETS_API_KEY}`,
      { signal: AbortSignal.timeout(10000) },
    );

    if (response.status >= 400) {
      console.log(`Failed to fetch freedge data: HTTP ${response.status}`);
      return [];
    }

    const data = (await response.json()) as { values?: string[][] };

    if (!data.values) {
      console.log(
        'No values in response, cannot update freedge external eatery',
      );
      console.log(data);
      return [];
    }

    const freedgeItems: RawDiningItem[] = [];

    console.log(`   Found ${data.values.length} rows in Google Sheets`);

    for (const item of data.values) {
      if (item.length < 5) {
        continue;
      }
      const email = item[1]?.trim();
      const itemName = item[4]?.trim();
      if (!email || !itemName) {
        continue;
      }
      if (!approvedEmails.includes(email)) {
        continue;
      }
      if (item.length > 11 && item[11] !== 'Yes') {
        continue;
      }
      freedgeItems.push({
        descr: itemName,
        category: 'Free Food',
        item: itemName,
        healthy: false,
        showCategory: true,
      });
    }
    return freedgeItems;
  } catch (error) {
    console.error('Error fetching freedge data:', error);
    return [];
  }
}

function fetchNonDiningHallMenu(
  diningItems: RawDiningItem[],
): RawOperatingHourEventMenuCategory[] {
  const grouped: Record<string, RawDiningItem[]> = {};

  for (const item of diningItems) {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item);
  }

  return Object.entries(grouped).map(([category, items]) => ({
    category,
    items: items.map((item) => ({
      item: item.item,
      healthy: item.healthy,
    })),
  }));
}

function extractAnnouncements(announcements?: { title: string }[]): string[] {
  if (!Array.isArray(announcements)) return [];

  return announcements
    .map((x) => x.title)
    .filter((title) => title && title.length > 0);
}

function transformStaticEatery(rawStaticEatery: RawStaticEatery) {
  const events: Array<{
    type: string;
    startTimestamp: Date;
    endTimestamp: Date;
    menu: Array<{
      category: string;
      items: Array<{
        item: string;
        healthy: boolean;
      }>;
    }>;
  }> = [];

  for (const operatingHour of rawStaticEatery.operatingHours) {
    for (const event of operatingHour.events) {
      const startDate = createWeeklyDate(operatingHour.weekday, event.start);
      const endDate = createWeeklyDate(operatingHour.weekday, event.end);

      if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }

      events.push({
        type: event.descr || 'General',
        startTimestamp: startDate,
        endTimestamp: endDate,
        menu: fetchNonDiningHallMenu(rawStaticEatery.diningItems) || [],
      });
    }
  }

  let menuSummary = '';
  if (rawStaticEatery.diningItems && rawStaticEatery.diningItems.length > 0) {
    const items = rawStaticEatery.diningItems
      .map((item) => item.item)
      .join(', ');
    menuSummary = items;
  }

  const cornellId =
    rawStaticEatery.id < 0 ? rawStaticEatery.id : -rawStaticEatery.id;

  let imageUrl: string;
  try {
    imageUrl = mapImageUrl(cornellId);
  } catch {
    imageUrl = DEFAULT_IMAGE_URL;
  }

  return {
    eatery: {
      cornellId: cornellId,
      name: rawStaticEatery.name,
      shortName: rawStaticEatery.nameshort,
      about: rawStaticEatery.about || '',
      shortAbout: rawStaticEatery.aboutshort || rawStaticEatery.about || '',
      cornellDining: rawStaticEatery.cornellDining ?? false,
      menuSummary: menuSummary,
      imageUrl: imageUrl,
      campusArea: mapCampusArea(rawStaticEatery.campusArea),
      onlineOrderUrl: rawStaticEatery.onlineOrderUrl,
      contactPhone: rawStaticEatery.contactPhone,
      contactEmail: rawStaticEatery.contactEmail,
      latitude: rawStaticEatery.latitude,
      longitude: rawStaticEatery.longitude,
      location: rawStaticEatery.location,
      paymentMethods: Array.from(
        new Set(rawStaticEatery.payMethods.map(mapPaymentMethod)),
      ),
      eateryTypes: rawStaticEatery.eateryTypes.map(mapEateryType),
      diningItems: rawStaticEatery.diningItems,
      announcements: extractAnnouncements(rawStaticEatery.announcements),
    },
    events,
  };
}

function transformEatery(rawEatery: RawEatery) {
  let imageUrl: string;
  try {
    imageUrl = mapImageUrl(rawEatery.id);
  } catch {
    imageUrl = DEFAULT_IMAGE_URL;
  }

  const eateryData = {
    cornellId: rawEatery.id,
    name: rawEatery.name,
    shortName: rawEatery.nameshort,
    about: rawEatery.about,
    shortAbout: rawEatery.aboutshort,
    cornellDining: rawEatery.cornellDining,
    menuSummary: 'Cornell Eatery',
    imageUrl: imageUrl,
    campusArea: mapCampusArea(rawEatery.campusArea),
    onlineOrderUrl: rawEatery.onlineOrderUrl,
    contactPhone: rawEatery.contactPhone,
    contactEmail: rawEatery.contactEmail,
    latitude: rawEatery.latitude,
    longitude: rawEatery.longitude,
    location: rawEatery.location,
    diningItems: rawEatery.diningItems,
    paymentMethods: Array.from(
      new Set(rawEatery.payMethods.map(mapPaymentMethod)),
    ),
    eateryTypes: rawEatery.eateryTypes.map(mapEateryType),
    announcements: extractAnnouncements(rawEatery.announcements),
  };

  const events: Array<{
    type: string;
    startTimestamp: Date;
    endTimestamp: Date;
    menu: Array<{
      category: string;
      items: Array<{
        item: string;
        healthy: boolean;
      }>;
    }>;
  }> = [];

  let cafeDiningItems: RawOperatingHourEventMenuCategory[] = [];
  if (!eateryData.eateryTypes.includes(EateryType.DINING_ROOM)) {
    cafeDiningItems = fetchNonDiningHallMenu(eateryData.diningItems);
  }
  for (const operatingHour of rawEatery.operatingHours) {
    for (const event of operatingHour.events) {
      if (!eateryData.eateryTypes.includes(EateryType.DINING_ROOM)) {
        events.push({
          type: event.descr,
          startTimestamp: new Date(event.startTimestamp * 1000),
          endTimestamp: new Date(event.endTimestamp * 1000),
          menu: cafeDiningItems,
        });
      } else {
        if (!event.menu || event.menu.length === 0) continue;
        events.push({
          type: event.descr,
          startTimestamp: new Date(event.startTimestamp * 1000),
          endTimestamp: new Date(event.endTimestamp * 1000),
          menu: event.menu.map((cat) => ({
            category: cat.category,
            items: cat.items.map((item) => ({
              item: item.item,
              healthy: item.healthy,
            })),
          })),
        });
      }
    }
  }

  return {
    eatery: eateryData,
    events,
  };
}

async function transformEateriesConcurrently(
  rawEateries: RawEatery[],
  concurrency: number = 5,
): Promise<ReturnType<typeof transformEatery>[]> {
  const results: ReturnType<typeof transformEatery>[] = [];
  const errors: Array<{ eatery: RawEatery; error: unknown }> = [];

  // Process in batches for better performance
  for (let i = 0; i < rawEateries.length; i += concurrency) {
    const batch = rawEateries.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(
      batch.map(async (rawEatery) => {
        try {
          const transformed = transformEatery(rawEatery);
          console.log(
            `   ✓ Transformed ${rawEatery.name} (${transformed.events.length} events)`,
          );
          return transformed;
        } catch (error) {
          console.error(`   ✗ Error transforming ${rawEatery.name}:`, error);
          throw error;
        }
      }),
    );

    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j];
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        errors.push({ eatery: batch[j], error: result.reason });
      }
    }
  }

  if (errors.length > 0) {
    const errorMessages = errors
      .map((e) => `Eatery "${e.eatery.name}": ${e.error}`)
      .join('\n');
    throw new Error(
      `Failed to transform ${errors.length} eatery(ies):\n${errorMessages}`,
    );
  }

  return results;
}

async function processAllEateries(
  transformedEateries: Array<{
    eatery: {
      cornellId: number | null;
      name: string;
      shortName: string;
      about: string;
      shortAbout: string;
      cornellDining: boolean;
      menuSummary: string;
      imageUrl: string;
      campusArea: CampusArea;
      onlineOrderUrl: string | null;
      contactPhone: string | null;
      contactEmail: string | null;
      latitude: number;
      longitude: number;
      location: string;
      paymentMethods: PaymentMethod[];
      eateryTypes: EateryType[];
      diningItems: RawDiningItem[];
      announcements: string[];
    };
    events: Array<{
      type: string;
      startTimestamp: Date;
      endTimestamp: Date;
      menu: Array<{
        category: string;
        items: Array<{
          item: string;
          healthy: boolean;
        }>;
      }>;
    }>;
  }>,
) {
  return await prisma.$transaction(
    async (tx) => {
      // Clear existing data
      await tx.event.deleteMany({});
      await tx.eatery.deleteMany({});

      // Process eateries in smaller batches within the transaction
      const BATCH_SIZE = 10;
      for (let i = 0; i < transformedEateries.length; i += BATCH_SIZE) {
        const batch = transformedEateries.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(({ eatery, events }) => {
            const { diningItems, ...eaterySanitized } = eatery;
            return tx.eatery.create({
              data: {
                ...eaterySanitized,
                events: {
                  create: events.map((rawEvent) => ({
                    type: mapEventType(rawEvent.type),
                    startTimestamp: rawEvent.startTimestamp,
                    endTimestamp: rawEvent.endTimestamp,
                    menu: {
                      create: rawEvent.menu.map((rawCategory) => ({
                        name: rawCategory.category,
                        items: {
                          create: rawCategory.items.map((rawItem) => ({
                            name: rawItem.item,
                          })),
                        },
                      })),
                    },
                  })),
                },
              },
            });
          }),
        );
      }
    },
    {
      maxWait: 20000, // Wait up to 20 seconds to start the transaction
      timeout: 60000, // Allow the transaction to run for up to 60 seconds
    },
  );
}

async function getAllEateriesData() {
  return await prisma.eatery.findMany({
    include: {
      events: {
        include: {
          menu: {
            include: {
              items: {
                include: {
                  dietaryPreferences: true,
                  allergens: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

async function updateServerCache(): Promise<void> {
  const serverUrl = process.env.SERVER_URL;
  const cacheRefreshHeader = process.env.CACHE_REFRESH_HEADER;
  const cacheRefreshSecret = process.env.CACHE_REFRESH_SECRET;

  if (!serverUrl || !cacheRefreshHeader || !cacheRefreshSecret) {
    console.log(
      '⚠️  Server cache update skipped: Missing SERVER_URL, CACHE_REFRESH_HEADER, or CACHE_REFRESH_SECRET',
    );
    return;
  }

  try {
    console.log('Fetching all eatery data for server update...');
    const startFetchTime = Date.now();
    const allEateryData = await getAllEateriesData();
    const fetchDuration = ((Date.now() - startFetchTime) / 1000).toFixed(2);
    console.log(
      `Fetched ${allEateryData.length} eateries in ${fetchDuration}s`,
    );

    console.log('Updating server cache with new eatery data...');
    const startUpdateTime = Date.now();
    const response = await fetch(`${serverUrl}/internal/cache/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [cacheRefreshHeader]: cacheRefreshSecret,
      },
      body: JSON.stringify({ eateries: allEateryData }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => 'Unable to read error response');
      throw new Error(
        `Server responded with status ${response.status}: ${errorText}`,
      );
    }

    const updateDuration = ((Date.now() - startUpdateTime) / 1000).toFixed(2);
    console.log(`✓ Server cache updated successfully in ${updateDuration}s`);
  } catch (error) {
    console.error(
      '✗ Failed to update server cache with new eatery data:',
      error,
    );
    // Don't throw - this is not critical enough to fail the entire scraper
  }
}

export async function main() {
  const startTime = Date.now();
  console.log('Starting scraper at', new Date(startTime).toString(), '\n');

  // Load static eateries
  const staticStartTime = Date.now();
  console.log(
    'Loading static eateries at',
    new Date(staticStartTime).toString(),
  );
  const staticEateries = loadStaticEateries();

  // Update freedge eatery with data from Google Sheets
  const freedgeStartTime = Date.now();
  console.log('Fetching freedge dining items from Google Sheets...');
  const freedgeDiningItems = await fetchFreedgeDiningItems();
  const freedgeEatery = staticEateries.find((eatery) => eatery.id === -46);
  if (freedgeEatery) {
    if (freedgeDiningItems.length > 0) {
      freedgeEatery.diningItems = freedgeDiningItems;
      console.log(
        `✓ Updated freedge with ${freedgeDiningItems.length} dining items`,
      );
    } else {
      console.log('⚠️  No freedge items found or freedge update skipped');
      console.log(
        '   (Check that GOOGLE_SHEETS_API_KEY, FREEDGE_SHEET_ID, and FREEDGE_APPROVED_EMAILS are set correctly)',
      );
    }
  } else {
    console.log(
      '⚠️  Freedge eatery not found in static eateries (looking for id: -46)',
    );
  }
  const freedgeDuration = ((Date.now() - freedgeStartTime) / 1000).toFixed(2);
  console.log(`Freedge update completed (${freedgeDuration}s)\n`);

  const transformedStaticEateries: ReturnType<typeof transformStaticEatery>[] =
    [];
  const skippedStaticEateries: Array<{ name: string; error: string }> = [];

  for (const staticEatery of staticEateries) {
    try {
      const transformed = transformStaticEatery(staticEatery);
      transformedStaticEateries.push(transformed);
    } catch (error) {
      skippedStaticEateries.push({
        name: staticEatery.name,
        error: error instanceof Error ? error.message : String(error),
      });
      console.log(
        `⚠️  Skipped static eatery "${staticEatery.name}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  if (skippedStaticEateries.length > 0) {
    console.log(
      `⚠️  Skipped ${skippedStaticEateries.length} static eatery(ies) due to errors\n`,
    );
  }
  const staticDuration = ((Date.now() - staticStartTime) / 1000).toFixed(2);
  console.log(
    `✓ Loaded ${transformedStaticEateries.length} static eateries (${staticDuration}s)\n`,
  );

  // Fetch API eateries
  const apiFetchStartTime = Date.now();
  const diningData = await getDiningData();
  const apiFetchDuration = ((Date.now() - apiFetchStartTime) / 1000).toFixed(2);
  console.log(
    `Found ${diningData.data.eateries.length} eateries from API (${apiFetchDuration}s)`,
  );

  const transformStartTime = Date.now();
  const workerCount = parseInt(process.env.WORKERS || '4', 10);
  console.log(
    `Transforming API eatery data with ${workerCount} concurrent workers...`,
  );
  const transformedApiEateries = await transformEateriesConcurrently(
    diningData.data.eateries,
    workerCount,
  );
  const transformDuration = ((Date.now() - transformStartTime) / 1000).toFixed(
    2,
  );
  console.log(
    `✓ Successfully transformed ${transformedApiEateries.length} API eateries (${transformDuration}s)\n`,
  );

  const eateryMap = new Map<
    number | null,
    (typeof transformedStaticEateries)[0]
  >();
  const overriddenEateries: Array<{
    cornellId: number | null;
    staticName: string;
    apiName: string;
  }> = [];

  for (const eatery of transformedStaticEateries) {
    eateryMap.set(eatery.eatery.cornellId, eatery);
  }

  for (const eatery of transformedApiEateries) {
    const existingEatery = eateryMap.get(eatery.eatery.cornellId);
    if (existingEatery) {
      overriddenEateries.push({
        cornellId: eatery.eatery.cornellId,
        staticName: existingEatery.eatery.name,
        apiName: eatery.eatery.name,
      });
    }
    eateryMap.set(eatery.eatery.cornellId, eatery);
  }

  const allTransformedEateries = Array.from(eateryMap.values());

  if (overriddenEateries.length > 0) {
    console.log(
      `⚠️  ${overriddenEateries.length} static eatery(ies) overridden by API eateries with same cornellId:`,
    );
    for (const { cornellId, staticName, apiName } of overriddenEateries) {
      console.log(
        `   - cornellId ${cornellId}: "${staticName}" (static) → "${apiName}" (API)`,
      );
    }
    console.log();
  }
  console.log(
    `Total eateries to process: ${allTransformedEateries.length} (${transformedStaticEateries.length} static + ${transformedApiEateries.length} API)\n`,
  );

  const dbStartTime = Date.now();
  console.log(
    `Inserting ${allTransformedEateries.length} eateries into database...`,
  );
  let dbDuration: string;
  try {
    await processAllEateries(allTransformedEateries);
    dbDuration = ((Date.now() - dbStartTime) / 1000).toFixed(2);
    console.log(`✓ Successfully processed all eateries (${dbDuration}s)`);
  } catch (error) {
    dbDuration = ((Date.now() - dbStartTime) / 1000).toFixed(2);
    console.error('✗ Error during database transaction:', error);
    throw error;
  }

  // Send newly populated data to server
  console.log('\nScraper run finished\n');
  await updateServerCache();

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ Dining data scraped successfully in ${totalDuration}s`);
  console.log(`   - Static eateries: ${staticDuration}s`);
  console.log(`   - Freedge update: ${freedgeDuration}s`);
  console.log(`   - API fetch: ${apiFetchDuration}s`);
  console.log(`   - API transformation: ${transformDuration}s`);
  console.log(`   - Database insertion: ${dbDuration}s`);
}

let isRunning = false;

async function runScraperSafely() {
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
    await main();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[Scheduler] Scraper completed successfully in ${duration}s`);
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`[Scheduler] Scraper failed after ${duration}s:`, error);
  } finally {
    isRunning = false;
  }
}

function startScraperScheduler() {
  const cronExpression = process.env.SCRAPER_CRON_SCHEDULE || '0 7,19 * * *';

  console.log('[Scheduler] Initializing scraper scheduler...');
  console.log(`[Scheduler] Schedule: ${cronExpression} (America/New_York)`);

  const task = cron.schedule(cronExpression, runScraperSafely, {
    timezone: 'America/New_York',
  });

  console.log('[Scheduler] Scraper scheduler started successfully');

  return task;
}

if (process.env.SCHEDULED_MODE === 'true') {
  console.log('[Scheduler] Running initial scraper on startup...');

  // Run scraper immediately on startup
  runScraperSafely()
    .then(() => {
      console.log('[Scheduler] Initial scraper run completed');
    })
    .catch((error) => {
      console.error('[Scheduler] Initial scraper run failed:', error);
    });

  // Start the scheduler for future runs
  startScraperScheduler();
  console.log(
    '[Scheduler] Scraper scheduler is running. Press Ctrl+C to stop.',
  );

  const gracefulShutdown = async () => {
    console.log('[Scheduler] Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
} else {
  main()
    .catch((e) => {
      console.error('Error during scraping:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
