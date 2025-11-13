import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { RawScrapedData } from './scraperTypes';

dotenv.config();

const prisma = new PrismaClient();

async function getDiningData(): Promise<RawScrapedData> {
  const diningData = await fetch(process.env.CORNELL_DINING_API_URL as string);
  const data = await diningData.json();
  return data;
}

async function main() {
  console.log('Starting scraper...');

  const diningData = await getDiningData();
  
  console.log(diningData);
  console.log('Dining data scraped successfully.');
}

main()
  .catch((e) => {
    console.error('Error during scraping:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
