const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const response = await fetch('https://mediacms-cw-u46015.vm.elestio.app/api/v1/media/');
    if (!response.ok) throw new Error(`MediaCMS returned ${response.status}`);
    const data = await response.json();
    const now = new Date();
    const videos = (data.results || []).filter(video => {
      if (!video.file) return false;
      if (video.status && video.status !== "published") return false;
      const created = new Date(video.created_at);
      return (now - created) < (24 * 60 * 60 * 1000);
    });
    res.render('feed', { videos });
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.render('feed', { videos: [], error: "Error loading videos." });
  }
});
module.exports = router;
