const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer config: any video type, max 200MB
const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

// Render the upload form (if you want to keep this for server-side pages)
router.get('/upload', (req, res) => {
  res.render('upload');
});

// MAIN PROXY UPLOAD HANDLER
router.post(
  '/upload',
  upload.single('video'), // field name must match your form
  async (req, res) => {
    if (!req.file) return res.status(400).send('No video uploaded.');

    // Get form fields
    const { title, description, category } = req.body;

    try {
      // 1. Fetch token from your own backend (or directly from MediaCMS)
      const tokenRes = await axios.post('https://snapbackend-new.onrender.com/api/mediacms-token');
      const token = tokenRes.data.token;
      if (!token) throw new Error('Failed to get MediaCMS token.');

      // 2. Prepare FormData for MediaCMS
      const form = new FormData();
      form.append('file', fs.createReadStream(req.file.path), req.file.originalname);
      if (title) form.append('title', title);
      if (description) form.append('description', description);
      if (category) form.append('category', category);

      // 3. Upload to MediaCMS
      const mcmsRes = await axios.post(
        'https://mediacms-cw-u46015.vm.elestio.app/api/v1/media/upload/',
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${token}`,
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      // 4. Delete file after upload
      fs.unlink(req.file.path, () => {});

      res.send('Video uploaded successfully! (pending approval by admin)');
    } catch (err) {
      if (req.file && req.file.path) fs.unlink(req.file.path, () => {});
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).send('File too large. Max 200MB allowed.');
      }
      console.error('Upload error:', err.response?.data || err.message);
      res.status(500).send('Failed to upload: ' + (err.response?.data?.detail || err.message));
    }
  }
);

module.exports = router;
