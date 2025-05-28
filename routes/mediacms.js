const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const upload = multer({ dest: 'uploads/' }); // Temp upload directory
const router = express.Router();

const MEDIACMS_URL = 'https://mediacms-cw-u46015.vm.elestio.app';
const MEDIACMS_USER = process.env.MEDIACMS_USER || 'your_admin_user'; // Set in .env
const MEDIACMS_PASS = process.env.MEDIACMS_PASS || 'your_admin_pass'; // Set in .env

let accessToken = null;

// Utility: Get MediaCMS token
async function getAccessToken() {
  if (accessToken) return accessToken;
  const res = await axios.post(`${MEDIACMS_URL}/api/token/`, {
    username: MEDIACMS_USER,
    password: MEDIACMS_PASS
  });
  accessToken = res.data.access;
  // For production: add expiry check & refresh
  return accessToken;
}

// 1. Proxy upload route: accepts file from frontend, uploads to MediaCMS
router.post('/upload-to-mediacms', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const token = await getAccessToken();

    const form = new FormData();
    form.append('title', req.body.title || 'Untitled');
    form.append('file', fs.createReadStream(req.file.path), req.file.originalname);

    const response = await axios.post(
      `${MEDIACMS_URL}/api/medias/`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${token}`
        }
      }
    );

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ success: true, mediaCMSResponse: response.data });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to upload to MediaCMS', details: err.response?.data || err.message });
  }
});

// 2. Fetch approved videos from MediaCMS
router.get('/videos', async (req, res) => {
  try {
    const token = await getAccessToken();
    const response = await axios.get(`${MEDIACMS_URL}/api/medias/?status=published`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json(response.data.results);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch videos from MediaCMS', details: err.response?.data || err.message });
  }
});

module.exports = router;
