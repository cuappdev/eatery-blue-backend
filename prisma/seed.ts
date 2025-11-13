import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Get admin emails from environment variable
  const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
  const adminEmails = adminEmailsEnv
    .split(',')
    .map((email) => email.trim())
    .filter((email) => email.length > 0);

  if (adminEmails.length === 0) {
    console.log('No admin emails found in ADMIN_EMAILS environment variable.');
    console.log('Skipping admin user seeding.');
  }

  console.log(`Found ${adminEmails.length} admin email(s) to seed.`);

  // Seed admin users
  for (const email of adminEmails) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Make sure the existing user is an admin
        if (existingUser.isAdmin !== true) {
          await prisma.user.update({
            where: { email },
            data: { isAdmin: true },
          });
          console.log(`✓ Updated user to admin: ${email} (ID: ${existingUser.id})`);
        } else {
          console.log(`✓ Admin user already exists: ${email} (ID: ${existingUser.id})`);
        }
        continue;
      }

      const user = await prisma.user.create({
        data: {
          email,
          isAdmin: true,
          // firebaseId and teamId are null until the user logs in
        },
      });

      console.log(`✓ Created admin user: ${email} (ID: ${user.id})`);
    } catch (error) {
      console.error(`✗ Failed to create admin user ${email}:`, error);
    }
  }

  try {
    const testEatery = await prisma.eatery.upsert({
      // Use a unique cornellId to find the eatery
      where: { cornellId: 9999 },
      // If it exists, do nothing
      update: {},
      // If it doesn't exist, create it with all required fields
      create: {
        cornellId: 9999,
        name: 'Test Eatery',
        shortName: 'Test',
        about: 'A simple eatery for testing.',
        cornellDining: false,
        menuSummary: 'Test items',
        imageUrl: 'https://placehold.co/600x400/ccc/fff?text=Test+Eatery',
        campusArea: 'CENTRAL',
        location: 'Ho Plaza',
        latitude: 42.4475,
        longitude: -76.483,
        paymentMethods: ['CASH', 'CARD'],
        eateryType: 'CAFE',
        events: {
          create: [
            {
              type: 'GENERAL',
              startTimestamp: new Date('2025-11-12T09:00:00-05:00'), // Nov 12, 2025 9:00 AM
              endTimestamp: new Date('2025-12-12T17:00:00-05:00'), // Dec 12, 2025 5:00 PM
              menu: {
                create: [
                  {
                    name: 'Main Menu',
                    items: {
                      create: [
                        {
                          name: 'Pizza',
                          basePrice: 10.99,
                        },
                        {
                          name: 'Matcha',
                          basePrice: 4.5,
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    });
    console.log(
      `Created or found test eatery: ${testEatery.name} (ID: ${testEatery.id})`,
    );
  } catch (error) {
    console.error('Failed to create test eatery:', error);
  }

  console.log('Seed completed!');
}



main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
