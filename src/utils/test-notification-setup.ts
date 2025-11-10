import { add } from 'date-fns';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const MY_TEST_FCM_TOKEN = 'YOUR_FCM_TOKEN';

  const MY_TEST_DEVICE_ID = '1234567890';
  const MY_FAVORITE_ITEM = 'Hot Cocoa';

  await prisma.eatery.deleteMany({ where: { name: 'Test Eatery' } });
  await prisma.user.deleteMany({ where: { deviceId: MY_TEST_DEVICE_ID } });

  const user = await prisma.user.create({
    data: {
      deviceId: MY_TEST_DEVICE_ID,
      favoritedItemNames: [MY_FAVORITE_ITEM],
      fcmTokens: {
        create: {
          token: MY_TEST_FCM_TOKEN,
        },
      },
    },
  });
  console.log(`Created user for device: ${user.deviceId}`);

  const now = new Date();
  const eventStart = now;
  const eventEnd = add(now, { hours: 2 });

  const eatery = await prisma.eatery.create({
    data: {
      name: 'Test Eatery',
      shortName: 'Test',
      about: 'Test eatery for notifs',
      cornellDining: true,
      menuSummary: 'Pizza',
      imageUrl: '',
      campusArea: 'CENTRAL',
      location: 'Here',
      latitude: 42.444,
      longitude: -76.501,
      paymentMethods: ['BRB'],
      eateryType: 'DINING_ROOM',
      events: {
        create: {
          type: 'DINNER',
          startTimestamp: eventStart,
          endTimestamp: eventEnd,
          menu: {
            create: {
              name: 'Test Menu',
              items: {
                create: {
                  name: MY_FAVORITE_ITEM,
                  basePrice: 5.99,
                },
              },
            },
          },
        },
      },
    },
  });
  console.log(`Created test eatery: ${eatery.name}`);
  console.log(
    `Created test item "${MY_FAVORITE_ITEM}" for event happening now.`,
  );

  console.log('✅ Test setup complete.');
  console.log(`You can now run: npm run send-notifications`);
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
