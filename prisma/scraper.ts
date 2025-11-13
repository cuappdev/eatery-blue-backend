import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { RawScrapedData, RawEatery, RawStaticEatery } from './scraperTypes';
import { mapCampusArea, mapEateryType, mapPaymentMethod, mapEventType, mapImageUrl, createWeeklyDate } from './mappers';
import { CampusArea, PaymentMethod, EateryType, EventType } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function getDiningData(): Promise<RawScrapedData> {
  const diningData = await fetch(process.env.CORNELL_DINING_API_URL as string);
  const data = await diningData.json();
  return data;
}

function loadStaticEateries(): RawStaticEatery[] {
  try {
    const staticEateriesPath = join(process.cwd(), 'prisma', 'staticEateries.json');
    const fileContent = readFileSync(staticEateriesPath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    const eateries = Array.isArray(data) ? data : (data.eateries || []);
    return eateries;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log('No static eateries file found, skipping...');
      return [];
    }
    throw error;
  }
}

function transformStaticEatery(rawStaticEatery: RawStaticEatery) {
  const events: Array<{
    type: string;
    startTimestamp: Date;
    endTimestamp: Date;
    menu: Array<{
      category: string;
      sortIdx: number;
      items: Array<{
        item: string;
        healthy: boolean;
        sortIdx: number;
      }>;
    }>;
  }> = [];

  const baseDate = new Date();
  
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
        menu: event.menu || [],
      });
    }
  }

  let menuSummary = '';
  if (rawStaticEatery.diningItems && rawStaticEatery.diningItems.length > 0) {
    const items = rawStaticEatery.diningItems.map((item) => item.item).join(', ');
    menuSummary = items;
  }

  const cornellId = rawStaticEatery.id < 0 ? rawStaticEatery.id : -rawStaticEatery.id;
  
  let imageUrl: string;
  try {
    imageUrl = mapImageUrl(cornellId);
  } catch {
    imageUrl = '';
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
      onlineOrderUrl: rawStaticEatery.onlineOrderUrl ?? null,
      contactPhone: rawStaticEatery.contactPhone ?? null,
      contactEmail: rawStaticEatery.contactEmail ?? null,
      latitude: rawStaticEatery.latitude,
      longitude: rawStaticEatery.longitude,
      location: rawStaticEatery.location,
      paymentMethods: Array.from(new Set(rawStaticEatery.payMethods.map(mapPaymentMethod))),
      eateryTypes: rawStaticEatery.eateryTypes.map(mapEateryType),
      announcements: rawStaticEatery.announcements || [],
    },
    events,
  };
}

function transformEatery(rawEatery: RawEatery) {
  const eateryData = {
    cornellId: rawEatery.id,
    name: rawEatery.name,
    shortName: rawEatery.nameshort,
    about: rawEatery.about,
    shortAbout: rawEatery.aboutshort,
    cornellDining: rawEatery.cornellDining,
    menuSummary: rawEatery.opHoursCalcDescr,
    imageUrl: mapImageUrl(rawEatery.id),
    campusArea: mapCampusArea(rawEatery.campusArea),
    onlineOrderUrl: rawEatery.onlineOrderUrl,
    contactPhone: rawEatery.contactPhone,
    contactEmail: rawEatery.contactEmail,
    latitude: rawEatery.latitude,
    longitude: rawEatery.longitude,
    location: rawEatery.location,
    paymentMethods: Array.from(new Set(rawEatery.payMethods.map(mapPaymentMethod))),
    eateryTypes: rawEatery.eateryTypes.map(mapEateryType),
    announcements: rawEatery.announcements,
  };

  const events: Array<{
    type: string;
    startTimestamp: Date;
    endTimestamp: Date;
    menu: Array<{
      category: string;
      sortIdx: number;
      items: Array<{
        item: string;
        healthy: boolean;
        sortIdx: number;
      }>;
    }>;
  }> = [];

  for (const operatingHour of rawEatery.operatingHours) {
    for (const event of operatingHour.events) {
      events.push({
        type: event.descr,
        startTimestamp: new Date(event.startTimestamp * 1000),
        endTimestamp: new Date(event.endTimestamp * 1000),
        menu: event.menu.map((cat) => ({
          category: cat.category,
          sortIdx: cat.sortIdx,
          items: cat.items.map((item) => ({
            item: item.item,
            healthy: item.healthy,
            sortIdx: item.sortIdx,
          })),
        })),
      });
    }
  }

  return {
    eatery: eateryData,
    events,
  };
}

async function transformEateriesConcurrently(
  rawEateries: RawEatery[],
  concurrency: number = 5
): Promise<Array<{ index: number; result: ReturnType<typeof transformEatery> }>> {
  const results: Array<{ index: number; result: ReturnType<typeof transformEatery> }> = [];
  const errors: Array<{ index: number; eatery: RawEatery; error: unknown }> = [];
  
  const queue: Array<{ index: number; eatery: RawEatery }> = rawEateries.map((eatery, index) => ({
    index,
    eatery,
  }));

  async function worker(workerId: number): Promise<void> {
    while (true) {
      await new Promise((resolve) => setImmediate(resolve));
      
      const item = queue.shift();
      if (!item) break;

      const { index, eatery: rawEatery } = item;

      try {
        const transformed = transformEatery(rawEatery);
        results.push({ index, result: transformed });
        console.log(`   [Worker ${workerId}] ✓ Transformed ${rawEatery.name} (${transformed.events.length} events)`);
      } catch (error) {
        errors.push({ index, eatery: rawEatery, error });
        console.error(`   [Worker ${workerId}] ✗ Error transforming ${rawEatery.name}:`, error);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  if (errors.length > 0) {
    const errorMessages = errors.map((e) => `Eatery "${e.eatery.name}" (index ${e.index}): ${e.error}`).join('\n');
    throw new Error(`Failed to transform ${errors.length} eatery(ies):\n${errorMessages}`);
  }

  results.sort((a, b) => a.index - b.index);
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
      announcements: string[];
    };
    events: Array<{
      type: string;
      startTimestamp: Date;
      endTimestamp: Date;
      menu: Array<{
        category: string;
        sortIdx: number;
        items: Array<{
          item: string;
          healthy: boolean;
          sortIdx: number;
        }>;
      }>;
    }>;
  }>
) {
  return await prisma.$transaction(async (tx) => {
    await tx.event.deleteMany({});
    await tx.eatery.deleteMany({});

    for (const { eatery, events } of transformedEateries) {
      await tx.eatery.create({
        data: {
          ...eatery,
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
    }
  });
}

async function testProcessEateries(numEateries: number) {
  console.log(`🧪 Starting test: Processing ${numEateries} eateries...\n`);

  try {
    console.log('1. Fetching dining data...');
    const diningData = await getDiningData();
    console.log(`   Found ${diningData.data.eateries.length} total eateries\n`);

    const testEateries = diningData.data.eateries.slice(0, numEateries);
    console.log(`2. Testing with ${testEateries.length} eateries:`);
    testEateries.forEach((eatery, i) => {
      console.log(`   ${i + 1}. ${eatery.name} (ID: ${eatery.id})`);
    });
    console.log();

    console.log('3. Transforming eatery data with 5 concurrent workers...');
    const transformResults = await transformEateriesConcurrently(testEateries, 5);
    const transformedEateries = transformResults.map((r) => r.result);
    console.log();

    console.log('4. Processing all eateries in a single transaction...');
    await processAllEateries(transformedEateries);
    console.log('   ✓ Transaction completed successfully\n');

    console.log('5. Verifying database results...');
    const dbEateries = await prisma.eatery.findMany({
      include: {
        events: {
          include: {
            menu: {
              include: {
                items: true,
              },
            },
          },
        },
      },
      orderBy: {
        cornellId: 'asc',
      },
    });

    console.log(`   Found ${dbEateries.length} eateries in database`);
    
    if (dbEateries.length !== testEateries.length) {
      throw new Error(
        `Expected ${testEateries.length} eateries, but found ${dbEateries.length}`
      );
    }

    let totalEvents = 0;
    let totalCategories = 0;
    let totalItems = 0;

    for (const dbEatery of dbEateries) {
      const events = dbEatery.events;
      totalEvents += events.length;
      
      for (const event of events) {
        const categories = event.menu;
        totalCategories += categories.length;
        
        for (const category of categories) {
          totalItems += category.items.length;
        }
      }
    }

    console.log(`   ✓ Total events: ${totalEvents}`);
    console.log(`   ✓ Total categories: ${totalCategories}`);
    console.log(`   ✓ Total items: ${totalItems}\n`);

    console.log('6. Test Summary:');
    console.log(`   ✓ All ${numEateries} eateries processed successfully`);
    console.log(`   ✓ Transaction completed atomically for ${numEateries} eateries`);
    console.log('   ✓ All data verified in database\n');

    console.log(`✅ Test passed! All ${numEateries} eateries processed correctly.\n`);

    return {
      success: true,
      eateriesProcessed: dbEateries.length,
      totalEvents,
      totalCategories,
      totalItems,
    };
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  }
}

async function main() {
  const startTime = Date.now();
  console.log('Starting scraper...\n');

  // Load static eateries
  const staticStartTime = Date.now();
  console.log('Loading static eateries...');
  const staticEateries = loadStaticEateries();
  const transformedStaticEateries: ReturnType<typeof transformStaticEatery>[] = [];
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
      console.log(`⚠️  Skipped static eatery "${staticEatery.name}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  if (skippedStaticEateries.length > 0) {
    console.log(`⚠️  Skipped ${skippedStaticEateries.length} static eatery(ies) due to errors\n`);
  }
  const staticDuration = ((Date.now() - staticStartTime) / 1000).toFixed(2);
  console.log(`✓ Loaded ${transformedStaticEateries.length} static eateries (${staticDuration}s)\n`);

  // Fetch API eateries
  const apiFetchStartTime = Date.now();
  const diningData = await getDiningData();
  const apiFetchDuration = ((Date.now() - apiFetchStartTime) / 1000).toFixed(2);
  console.log(`Found ${diningData.data.eateries.length} eateries from API (${apiFetchDuration}s)`);

  const transformStartTime = Date.now();
  console.log('Transforming API eatery data with 5 concurrent workers...');
  const transformResults = await transformEateriesConcurrently(diningData.data.eateries, 5);
  const transformedApiEateries = transformResults.map((r) => r.result);
  const transformDuration = ((Date.now() - transformStartTime) / 1000).toFixed(2);
  console.log(`✓ Successfully transformed ${transformedApiEateries.length} API eateries (${transformDuration}s)\n`);

  // Merge static and API eateries (API eateries override static ones if same cornellId)
  const eateryMap = new Map<number | null, typeof transformedStaticEateries[0]>();
  const overriddenEateries: Array<{ cornellId: number | null; staticName: string; apiName: string }> = [];
  
  // Add static eateries first
  for (const eatery of transformedStaticEateries) {
    eateryMap.set(eatery.eatery.cornellId, eatery);
  }
  
  // Override with API eateries (they take precedence)
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
    console.log(`⚠️  ${overriddenEateries.length} static eatery(ies) overridden by API eateries with same cornellId:`);
    for (const { cornellId, staticName, apiName } of overriddenEateries) {
      console.log(`   - cornellId ${cornellId}: "${staticName}" (static) → "${apiName}" (API)`);
    }
    console.log();
  }
  console.log(`Total eateries to process: ${allTransformedEateries.length} (${transformedStaticEateries.length} static + ${transformedApiEateries.length} API)\n`);

  const dbStartTime = Date.now();
  console.log(`Inserting ${allTransformedEateries.length} eateries into database...`);
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
  
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ Dining data scraped successfully in ${totalDuration}s`);
  console.log(`   - Static eateries: ${staticDuration}s`);
  console.log(`   - API fetch: ${apiFetchDuration}s`);
  console.log(`   - API transformation: ${transformDuration}s`);
  console.log(`   - Database insertion: ${dbDuration}s`);
}

if (process.env.TEST_MODE === 'true') {
  testProcessEateries(33)
    .catch((e) => {
      console.error('Error during test:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
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
