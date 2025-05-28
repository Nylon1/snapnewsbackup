// routes/upload.js
const express   = require('express');
const cors      = require('cors');
const multer    = require('multer');
const path      = require('path');
const fs        = require('fs');
const axios     = require('axios');
const FormData  = require('form-data');
const router    = express.Router();

// Directories
const uploadsDir = path.join(__dirname, '..', 'uploads'); // changed to root uploads folder

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 60 * 1024 * 1024 }, // 60 MB limit
  fileFilter: (req, file, cb) => {
    const ok = /mp4/.test(file.mimetype) && /\.mp4$/.test(file.originalname.toLowerCase());
    cb(ok ? null : new Error('Only MP4 files are allowed'), ok);
  }
});

// Render the upload form
router.get('/upload', (req, res) => {
  res.render('upload');
});

// CORS options
const corsOptions = {
  origin: 'https://snap-news.onrender.com',
  methods: ['POST','OPTIONS'],
  allowedHeaders: ['Content-Type']
};

router.options('/upload', cors(corsOptions));

// Main POST handler: Forwards file to MediaCMS
router.post(
  '/upload',
  cors(corsOptions),
  upload.single('video'), // <-- your form input must be named 'video'
  async (req, res) => {
    if (!req.file) return res.status(400).send('No video uploaded.');

    try {
      // Forward file to your MediaCMS API proxy
      const form = new FormData();
      form.append('title', req.body.title || 'Untitled');
      form.append('file', fs.createReadStream(req.file.path), req.file.originalname);

      // Call the backend proxy endpoint (change localhost:3000 if your API runs elsewhere)
      const response = await axios.post(
        'http://localhost:3000/api/mediacms/upload-to-mediacms',
        form,
        { headers: form.getHeaders() }
      );

      // Clean up temp file
      fs.unlinkSync(req.file.path);

      // Optionally, show a confirmation or redirect
      res.send('Video uploaded successfully! (pending approval by admin)');
    } catch (err) {
      console.error(err.response?.data || err.message);
      res.status(500).send('Failed to upload to MediaCMS.');
    }
  }
);

module.exports = router;
