import { S3Client, PutObjectCommand, CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import neo4j from 'neo4j-driver';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// S3/MinIO configuration
const s3Config = {
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: true,
};

const BUCKET = process.env.S3_BUCKET || 'game-planner-images';
const s3Client = new S3Client(s3Config);

// Neo4j configuration
const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password';

const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));

async function ensureBucketExists() {
  let bucketCreated = false;

  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET }));
    console.log(`Bucket ${BUCKET} already exists`);
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      console.log(`Creating bucket ${BUCKET}...`);
      await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET }));
      console.log(`Bucket ${BUCKET} created`);
      bucketCreated = true;
    } else {
      throw error;
    }
  }

  // Set public read policy (for development with MinIO)
  if (bucketCreated) {
    const policy = {
      Version: '2012-10-17',
      Statement: [{
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${BUCKET}/*`]
      }]
    };

    try {
      await s3Client.send(new PutBucketPolicyCommand({
        Bucket: BUCKET,
        Policy: JSON.stringify(policy)
      }));
      console.log('Bucket policy set for public read access');
    } catch (policyError) {
      console.warn('Could not set bucket policy:', policyError.message);
    }
  }
}

async function uploadFile(filePath, key) {
  const fileBuffer = await fs.readFile(filePath);
  const mimeType = filePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  }));

  return {
    key,
    size: fileBuffer.length,
    mimeType,
  };
}

async function createImageNode(session, entityId, imageData, rank) {
  const imageId = uuidv4();

  await session.run(`
    MATCH (e {id: $entityId})
    CREATE (i:Image {
      id: $imageId,
      filename: $filename,
      key: $key,
      mimeType: $mimeType,
      size: $size,
      uploadedAt: datetime()
    })
    CREATE (e)-[:HAS_IMAGE {rank: $rank}]->(i)
  `, {
    entityId,
    imageId,
    filename: imageData.filename,
    key: imageData.key,
    mimeType: imageData.mimeType,
    size: neo4j.int(imageData.size),
    rank: neo4j.int(rank),
  });

  return imageId;
}

async function migrateImages() {
  const publicDir = path.join(process.cwd(), 'public', 'entity-images');

  console.log('Starting image migration...');
  console.log(`Looking for images in: ${publicDir}`);

  // Ensure bucket exists
  await ensureBucketExists();

  const session = driver.session();

  try {
    // Check if directory exists
    try {
      await fs.access(publicDir);
    } catch {
      console.log('No public/entity-images directory found. Nothing to migrate.');
      return;
    }

    // Get all entity directories
    const entityDirs = await fs.readdir(publicDir);
    console.log(`Found ${entityDirs.length} entity directories`);

    for (const entityId of entityDirs) {
      const entityDir = path.join(publicDir, entityId);
      const stat = await fs.stat(entityDir);

      if (!stat.isDirectory()) continue;

      console.log(`\nProcessing entity: ${entityId}`);

      // Check if entity already has images in Neo4j
      const existingCheck = await session.run(`
        MATCH (e {id: $entityId})-[:HAS_IMAGE]->(i:Image)
        RETURN count(i) as imageCount
      `, { entityId });

      const existingCount = existingCheck.records[0]?.get('imageCount')?.toNumber() || 0;
      if (existingCount > 0) {
        console.log(`  Entity already has ${existingCount} images, skipping...`);
        continue;
      }

      // Get all images in directory
      const files = await fs.readdir(entityDir);
      const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));

      console.log(`  Found ${imageFiles.length} images`);

      let rank = 1;
      for (const imageFile of imageFiles) {
        const filePath = path.join(entityDir, imageFile);
        const key = `entities/${entityId}/${uuidv4()}-${imageFile}`;

        console.log(`  Uploading: ${imageFile} -> ${key}`);

        try {
          const uploadResult = await uploadFile(filePath, key);
          await createImageNode(session, entityId, {
            filename: imageFile,
            key,
            mimeType: uploadResult.mimeType,
            size: uploadResult.size,
          }, rank);
          rank++;
          console.log(`    ✓ Uploaded and linked to entity`);
        } catch (error) {
          console.error(`    ✗ Error: ${error.message}`);
        }
      }
    }

    console.log('\nMigration complete!');
  } finally {
    await session.close();
    await driver.close();
  }
}

// Run migration
migrateImages().catch(console.error);
