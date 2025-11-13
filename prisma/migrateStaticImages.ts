import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

dotenv.config();

const SPACES_ENDPOINT = process.env.DO_SPACES_ENDPOINT || 'https://nyc3.digitaloceanspaces.com';
const SPACES_BUCKET = process.env.DO_SPACES_BUCKET || 'appdev-upload';
const SPACES_ACCESS_KEY = process.env.DO_SPACES_ACCESS_KEY || '';
const SPACES_SECRET_KEY = process.env.DO_SPACES_SECRET_KEY || '';
const SPACES_REGION = process.env.DO_SPACES_REGION || 'nyc3';
const SPACES_PUBLIC_URL = process.env.DO_SPACES_PUBLIC_URL || `https://${SPACES_BUCKET}.nyc3.digitaloceanspaces.com`;

const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/cuappdev/assets/master/eatery/eatery-images';
const TEMP_DIR = join(process.cwd(), 'temp-images');

const STATIC_EATERY_IMAGES = [
  { filename: 'Terrace.jpg', cornellId: -33 },
  { filename: 'Macs-Cafe.jpg', cornellId: -34 },
  { filename: 'Zeus.jpg', cornellId: -35 },
  { filename: 'Gimme-Coffee.jpg', cornellId: -36 },
  { filename: 'Louies-Lunch.jpg', cornellId: -37 },
  { filename: 'Anabels-Grocery.jpg', cornellId: -38 },
  { filename: 'Freege.jpg', cornellId: -46 },
];

const s3Client = new S3Client({
  endpoint: SPACES_ENDPOINT,
  region: SPACES_REGION,
  credentials: {
    accessKeyId: SPACES_ACCESS_KEY,
    secretAccessKey: SPACES_SECRET_KEY,
  },
  forcePathStyle: false,
});

interface MigrationResult {
  filename: string;
  cornellId: number;
  success: boolean;
  error?: string;
  url?: string;
}

/**
 * Download image from GitHub
 */
async function downloadImage(imageUrl: string, filename: string): Promise<string> {
  const filePath = join(TEMP_DIR, filename);
  
  if (existsSync(filePath)) {
    console.log(`   ⏭️  Skipping download (already exists): ${filename}`);
    return filePath;
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download ${imageUrl}: ${response.status} ${response.statusText}`);
    }

    const fileStream = createWriteStream(filePath);
    const body = response.body;
    
    if (!body) {
      throw new Error(`No response body for ${imageUrl}`);
    }

    const nodeStream = Readable.fromWeb(body as any);
    await pipeline(nodeStream, fileStream);

    return filePath;
  } catch (error) {
    throw new Error(`Error downloading ${imageUrl}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Upload image to Digital Ocean Spaces
 */
async function uploadToSpaces(
  filePath: string,
  filename: string,
  contentType: string = 'image/jpeg'
): Promise<string> {
  const fs = await import('fs/promises');
  const fileContent = await fs.readFile(filePath);

  // Determine content type from filename
  if (filename.endsWith('.png')) {
    contentType = 'image/png';
  } else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
    contentType = 'image/jpeg';
  } else if (filename.endsWith('.gif')) {
    contentType = 'image/gif';
  } else if (filename.endsWith('.webp')) {
    contentType = 'image/webp';
  } else {
    contentType = 'image/jpeg';
  }

  const key = `eatery-images/${filename}`;

  // Check if file already exists in Spaces
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: SPACES_BUCKET,
        Key: key,
      })
    );
    console.log(`   ⏭️  Skipping upload (already exists in Spaces): ${filename}`);
    return `${SPACES_PUBLIC_URL}/${key}`;
  } catch (error: any) {
    if (error.name !== 'NotFound') {
      throw error;
    }
  }

  const command = new PutObjectCommand({
    Bucket: SPACES_BUCKET,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    ACL: 'public-read',
  });

  await s3Client.send(command);

  return `${SPACES_PUBLIC_URL}/${key}`;
}

/**
 * Migrate a single image
 */
async function migrateImage(image: { filename: string; cornellId: number }): Promise<MigrationResult> {
  try {
    const githubUrl = `${GITHUB_BASE_URL}/${image.filename}`;
    
    console.log(`   📥 Downloading: ${image.filename}`);
    const localPath = await downloadImage(githubUrl, image.filename);

    console.log(`   📤 Uploading to Spaces: ${image.filename}`);
    const url = await uploadToSpaces(localPath, image.filename);

    return {
      filename: image.filename,
      cornellId: image.cornellId,
      success: true,
      url,
    };
  } catch (error) {
    return {
      filename: image.filename,
      cornellId: image.cornellId,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Main migration function
 */
async function migrateStaticImages(dryRun: boolean = false) {
  console.log('🚀 Starting static eatery image migration from GitHub to Digital Ocean Spaces\n');

  // Validate configuration
  if (!SPACES_BUCKET || !SPACES_ACCESS_KEY || !SPACES_SECRET_KEY) {
    throw new Error(
      'Missing Digital Ocean Spaces configuration. Please set:\n' +
      '  - DO_SPACES_ENDPOINT\n' +
      '  - DO_SPACES_BUCKET\n' +
      '  - DO_SPACES_ACCESS_KEY\n' +
      '  - DO_SPACES_SECRET_KEY\n' +
      '  - DO_SPACES_REGION (optional, defaults to nyc3)\n' +
      '  - DO_SPACES_PUBLIC_URL (optional, for CDN URLs)'
    );
  }

  // Create temp directory
  if (!existsSync(TEMP_DIR)) {
    mkdirSync(TEMP_DIR, { recursive: true });
  }

  try {
    console.log(`📊 Found ${STATIC_EATERY_IMAGES.length} static eatery images to migrate\n`);

    const results: MigrationResult[] = [];
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Process each image
    for (let i = 0; i < STATIC_EATERY_IMAGES.length; i++) {
      const image = STATIC_EATERY_IMAGES[i];
      console.log(`[${i + 1}/${STATIC_EATERY_IMAGES.length}] Processing: ${image.filename} (cornellId: ${image.cornellId})`);

      if (dryRun) {
        console.log(`   🔍 DRY RUN - Would migrate: ${GITHUB_BASE_URL}/${image.filename} → ${SPACES_PUBLIC_URL}/eatery-images/${image.filename}\n`);
        results.push({
          filename: image.filename,
          cornellId: image.cornellId,
          success: true,
          url: `${SPACES_PUBLIC_URL}/eatery-images/${image.filename}`,
        });
        successCount++;
      } else {
        const result = await migrateImage(image);
        results.push(result);

        if (result.success) {
          if (result.url?.includes('already exists')) {
            skipCount++;
          } else {
            successCount++;
          }
          console.log(`   ✅ Migrated: ${result.url}\n`);
        } else {
          errorCount++;
          console.log(`   ❌ Error: ${result.error}\n`);
        }
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary');
    console.log('='.repeat(60));
    console.log(`Total images: ${STATIC_EATERY_IMAGES.length}`);
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`⏭️  Skipped (already exists): ${skipCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    if (dryRun) {
      console.log('\n⚠️  DRY RUN MODE - No images were actually migrated');
    }

    // Print errors if any
    if (errorCount > 0) {
      console.log('\n❌ Failed migrations:');
      results
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`   - ${r.filename}: ${r.error}`);
        });
    }

    // Print migrated URLs
    if (successCount > 0 && !dryRun) {
      console.log('\n📝 Migrated image URLs:');
      results
        .filter((r) => r.success && r.url)
        .forEach((r) => {
          console.log(`   ${r.filename}: ${r.url}`);
        });
    }

    console.log('\n✅ Migration completed!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
const dryRun = process.env.DRY_RUN === 'true';

migrateStaticImages(dryRun)
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

