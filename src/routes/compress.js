const router = require('express').Router();
const multer = require('multer');
const sharp = require('sharp');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const quality = Math.min(100, Math.max(1, parseInt(req.body.quality) || 80));
    const format = ['jpeg', 'webp', 'png'].includes(req.body.format) ? req.body.format : 'jpeg';
    const maxWidth = parseInt(req.body.maxWidth) || 0;

    let pipeline = sharp(req.file.buffer);

    // Optionally resize
    if (maxWidth > 0) {
      pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
    }

    // Get metadata for output info
    const meta = await sharp(req.file.buffer).metadata();

    if (format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    } else if (format === 'webp') {
      pipeline = pipeline.webp({ quality });
    } else if (format === 'png') {
      pipeline = pipeline.png({ compressionLevel: Math.round((100 - quality) / 11) });
    }

    const compressed = await pipeline.toBuffer();
    const outMeta = await sharp(compressed).metadata();

    res.json({
      originalSize: req.file.size,
      compressedSize: compressed.length,
      originalWidth: meta.width,
      originalHeight: meta.height,
      outWidth: outMeta.width,
      outHeight: outMeta.height,
      savings: Math.max(0, Math.round((1 - compressed.length / req.file.size) * 100)),
      data: compressed.toString('base64'),
      mimeType: `image/${format}`,
      originalName: req.file.originalname,
      format
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
