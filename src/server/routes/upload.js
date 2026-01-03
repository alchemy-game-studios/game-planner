import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { uploadImage, deleteImage, getImageUrl } from '../storage/s3-client.js';
import neo4j from 'neo4j-driver';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Neo4j driver - will be injected
let driver = null;

export function setUploadDriver(d) {
  driver = d;
}

// Upload image for an entity
router.post('/:entityType/:entityId', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { entityType, entityId } = req.params;
    const validTypes = ['universe', 'place', 'character', 'item'];

    if (!validTypes.includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }

    const imageId = uuidv4();
    const ext = path.extname(req.file.originalname) || '.jpg';
    const key = `entities/${entityId}/${imageId}${ext}`;

    // Upload to S3/MinIO
    await uploadImage(req.file.buffer, key, req.file.mimetype);

    // Get current max rank for this entity
    const session = driver.session();
    try {
      const rankResult = await session.run(`
        MATCH (e {id: $entityId})-[r:HAS_IMAGE]->(i:Image)
        RETURN COALESCE(MAX(r.rank), 0) as maxRank
      `, { entityId });

      const maxRank = rankResult.records[0]?.get('maxRank')?.toNumber() || 0;
      const newRank = maxRank + 1;

      // Create Image node and relationship
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
        RETURN i
      `, {
        entityId,
        imageId,
        filename: req.file.originalname,
        key,
        mimeType: req.file.mimetype,
        size: neo4j.int(req.file.size),
        rank: neo4j.int(newRank),
      });

      res.json({
        id: imageId,
        filename: req.file.originalname,
        url: getImageUrl(key),
        mimeType: req.file.mimetype,
        size: req.file.size,
        rank: newRank,
      });
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete an image
router.delete('/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;

    const session = driver.session();
    try {
      // Get image key before deleting
      const result = await session.run(`
        MATCH (i:Image {id: $imageId})
        RETURN i.key as key
      `, { imageId });

      if (result.records.length === 0) {
        return res.status(404).json({ error: 'Image not found' });
      }

      const key = result.records[0].get('key');

      // Delete from S3/MinIO
      await deleteImage(key);

      // Delete from Neo4j
      await session.run(`
        MATCH (i:Image {id: $imageId})
        DETACH DELETE i
      `, { imageId });

      res.json({ success: true });
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reorder images for an entity
router.put('/:entityId/reorder', express.json(), async (req, res) => {
  try {
    const { entityId } = req.params;
    const { imageIds } = req.body;

    if (!Array.isArray(imageIds)) {
      return res.status(400).json({ error: 'imageIds must be an array' });
    }

    const session = driver.session();
    try {
      // Update ranks based on array order
      for (let i = 0; i < imageIds.length; i++) {
        await session.run(`
          MATCH (e {id: $entityId})-[r:HAS_IMAGE]->(i:Image {id: $imageId})
          SET r.rank = $rank
        `, {
          entityId,
          imageId: imageIds[i],
          rank: neo4j.int(i + 1),
        });
      }

      // Return updated images
      const result = await session.run(`
        MATCH (e {id: $entityId})-[r:HAS_IMAGE]->(i:Image)
        RETURN i, r.rank as rank
        ORDER BY r.rank
      `, { entityId });

      const images = result.records.map(record => {
        const img = record.get('i').properties;
        return {
          id: img.id,
          filename: img.filename,
          url: getImageUrl(img.key),
          mimeType: img.mimeType,
          size: typeof img.size === 'object' ? img.size.toNumber() : img.size,
          rank: record.get('rank').toNumber(),
        };
      });

      res.json(images);
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('Reorder error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all images for an entity
router.get('/:entityId', async (req, res) => {
  try {
    const { entityId } = req.params;

    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (e {id: $entityId})-[r:HAS_IMAGE]->(i:Image)
        RETURN i, r.rank as rank
        ORDER BY r.rank
      `, { entityId });

      const images = result.records.map(record => {
        const img = record.get('i').properties;
        return {
          id: img.id,
          filename: img.filename,
          url: getImageUrl(img.key),
          mimeType: img.mimeType,
          size: typeof img.size === 'object' ? img.size.toNumber() : img.size,
          rank: record.get('rank').toNumber(),
        };
      });

      res.json(images);
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
