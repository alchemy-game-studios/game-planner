import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configuration - defaults to local MinIO, easily switchable to AWS S3
const config = {
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: true, // Required for MinIO
};

const BUCKET = process.env.S3_BUCKET || 'game-planner-images';

const s3Client = new S3Client(config);

/**
 * Upload an image to S3/MinIO
 * @param {Buffer} buffer - File buffer
 * @param {string} key - Object key (path in bucket)
 * @param {string} mimeType - Content type
 * @returns {Promise<{key: string, url: string}>}
 */
export async function uploadImage(buffer, key, mimeType) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  return {
    key,
    url: `${config.endpoint}/${BUCKET}/${key}`,
  };
}

/**
 * Delete an image from S3/MinIO
 * @param {string} key - Object key
 * @returns {Promise<void>}
 */
export async function deleteImage(key) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Get a signed URL for temporary access
 * @param {string} key - Object key
 * @param {number} expiresIn - Expiration in seconds (default 1 hour)
 * @returns {Promise<string>}
 */
export async function getImageSignedUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Get the public URL for an image (for MinIO with public access)
 * Uses /s3 proxy path in development for browser access
 * @param {string} key - Object key
 * @returns {string}
 */
export function getImageUrl(key) {
  // In development, use the /s3 proxy path (handled by Vite)
  // In production, use the actual S3 endpoint
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    return `${config.endpoint}/${BUCKET}/${key}`;
  }
  return `/s3/${BUCKET}/${key}`;
}

export { BUCKET, s3Client };
