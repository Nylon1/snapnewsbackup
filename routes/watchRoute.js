// routes/watchRoute.js
const express = require('express');
const router  = express.Router();

// If Node <18, uncomment next line and run: npm install node-fetch
// const fetch = require('node-fetch');

router.get('/watch/:id', async (req, res) => {
  // (1) This runs whenever someone visits /watch/<token>
  const token = req.params.id;
  const API_BASE = 'https://mediacms-cw-u46015.vm.elestio.app';

  try {
    // (2) Fetch the video JSON from your MediaCMS API
    const apiUrl = `${API_BASE}/api/v1/media/${token}`;
    const response = await fetch(apiUrl);

    // If API returned 404 or any non-OK, show 404 page
    if (!response.ok) {
      return res.status(404).render('404', { message: 'Snap not found' });
    }

    // (3) Parse the JSON
    const video = await response.json();

    // (4) Convert any relative thumbnails/files into absolute URLs
    if (video.thumbnail_url && !video.thumbnail_url.startsWith('http')) {
      video.thumbnail_url = API_BASE + video.thumbnail_url;
    }
    if (video.file && !video.file.startsWith('http')) {
      video.file = API_BASE + video.file;
    }

    // (5) Turn created_at into a Date object so EJS can toLocaleString() it
    if (video.created_at) {
      video.created_at = new Date(video.created_at);
    }

    // (6) If user is a string, make it an object { username }
    if (video.user && typeof video.user === 'string') {
      video.user = { username: video.user };
    }

    // (7) Render views/watch.ejs, passing in { video }
    return res.render('watch', { video });
  } catch (err) {
    console.error('Error in /watch/:id route:', err);
    return res.status(500).render('404', { message: 'Server error' });
  }
});

module.exports = router;
