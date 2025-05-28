// routes/feedRoute.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Update this if your backend API runs on a different host/port
const MEDIACMS_API = 'http://localhost:3000/api/mediacms/videos';

// Main feed route
router.get('/feed', async (req, res) => {
  try {
    // Fetch videos from MediaCMS via your API proxy
    const response = await axios.get(MEDIACMS_API);
    const videos = response.data; // Array of video objects from MediaCMS

    // Optionally, add an expiresAt field if you want to display expiry (24h)
    const enrichedVideos = videos.map(video => ({
      ...video,
      expiresAt: video.created_at
        ? new Date(new Date(video.created_at).getTime() + 24 * 60 * 60 * 1000)
        : null
    }));

    // Render to EJS (or return JSON)
    res.render('feed', { videos: enrichedVideos });

  } catch (err) {
    console.error('❌ Error loading feed:', err.response?.data || err.message);
    res.status(500).send('Server error loading feed.');
  }
});

module.exports = router;
