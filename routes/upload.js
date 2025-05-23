// routes/upload.js
const express   = require('express');
const cors      = require('cors');
const multer    = require('multer');
const path      = require('path');
const fs        = require('fs');
const ffmpeg    = require('fluent-ffmpeg');
const router    = express.Router();
const Content   = require('../models/Content');

// Directories
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
const thumbsDir  = path.join(__dirname, '..', 'public', 'thumbnails');
const shareDir   = path.join(__dirname, '..', 'public', 'share');
const templatePath = path.join(__dirname, '..', 'views', 'share_template.html');

// Ensure directories exist
[uploadsDir, thumbsDir, shareDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 60 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /mp4/.test(file.mimetype) && /\.mp4$/.test(file.originalname.toLowerCase());
    cb(ok ? null : new Error('Only MP4 files are allowed'), ok);
  }
});

// Render the upload form
router.get('/upload', (req, res) => {
  res.render('upload');
});

// CORS preflight and POST for uploads
const corsOptions = {
  origin: 'https://snap-news.onrender.com',
  methods: ['POST','OPTIONS'],
  allowedHeaders: ['Content-Type']
};

router.options('/upload', cors(corsOptions));

router.post(
  '/upload',
  cors(corsOptions),
  upload.single('video'),
  (req, res) => {
    const { title, description, category } = req.body;
    if (!req.file) return res.status(400).send('No video uploaded.');

    const filename     = req.file.filename.replace('.mp4','');
    const thumbFilename = `${filename}.jpg`;

    // Generate thumbnail
    ffmpeg(path.join(uploadsDir, req.file.filename))
      .screenshots({
        timestamps: ['00:00:01'],
        filename: thumbFilename,
        folder: thumbsDir,
        size: '320x240'
      })
      .on('end', async () => {
        // Save to MongoDB
        try {
          const newVideo = new Content({
            title,
            description,
            category,
            videoUrl: `/uploads/${req.file.filename}`,
            thumbnail: `/thumbnails/${thumbFilename}`,
            status: 'pending',
            type: 'user',
            createdAt: new Date()
          });
          await newVideo.save();

          // Render share template (or redirect)
          fs.readFile(templatePath, 'utf8', (err, html) => {
            if (err) return res.status(500).send('Template error.');
            const shareHTML = html
              .replace(/{{TITLE}}/g, title)
              .replace(/{{DESCRIPTION}}/g, description)
              .replace(/{{FILENAME}}/g, filename)
              .replace(/{{THUMBNAIL}}/g, thumbFilename)
              .replace(/{{ID}}/g, newVideo._id);
            fs.writeFile(path.join(shareDir, `${filename}.html`), shareHTML, err => {
              if (err) return res.status(500).send('Share file error.');
              res.send(shareHTML);
            });
          });
        } catch (dbErr) {
          console.error(dbErr);
          res.status(500).send('Database save failed.');
        }
      })
      .on('error', err => {
        console.error('FFmpeg error:', err);
        res.status(500).send('Thumbnail generation failed.');
      });
  }
);

module.exports = router;
