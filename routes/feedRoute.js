// routes/feedRoute.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Use the deployed API URL for production
const MEDIACMS_API = process.env.NODE_ENV === 'production'
   'https://snap-news.onrender.com/api/mediacms/videos'

router.get('/feed', async (req, res) => {
  try {
    const response = await axios.get(MEDIACMS_API);
    const videos = response.data;

    const enrichedVideos = videos.map(video => ({
      ...video,
      expiresAt: video.created_at
        ? new Date(new Date(video.created_at).getTime() + 24 * 60 * 60 * 1000)
        : null
    }));

    res.render('feed', { videos: enrichedVideos });
  } catch (err) {
    console.error('❌ Error loading feed:', err.response?.data || err.message);
    res.status(500).send('Server error loading feed.');
  }
});

module.exports = router;

















