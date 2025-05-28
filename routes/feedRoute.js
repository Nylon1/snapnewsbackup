const express = require('express');
const router = express.Router();

const MEDIA_BASE = "https://mediacms-cw-u46015.vm.elestio.app";

router.get('/', async (req, res) => {
  try {
    const response = await fetch(MEDIA_BASE + '/api/v1/media/');
    if (!response.ok) throw new Error(`MediaCMS returned ${response.status}`);
    const data = await response.json();
    const now = new Date();

    let videos = (data.results || []).filter(video => {
      if (video.state !== "public") return false;
      const created = new Date(video.add_date);
      return (now - created) < (24 * 60 * 60 * 1000);
    });

    // For each video, fetch direct video file from api_url
    const videosWithFiles = await Promise.all(videos.map(async video => {
      try {
        const detailsRes = await fetch(video.api_url);
        if (!detailsRes.ok) throw new Error('Failed to fetch video details');
        const details = await detailsRes.json();

        let file = null;
        // Try 720p, then 480p, then 360p, then original
        if (details.encodings_info && details.encodings_info["720"] && details.encodings_info["720"].h264) {
          file = MEDIA_BASE + details.encodings_info["720"].h264.url;
        } else if (details.encodings_info && details.encodings_info["480"] && details.encodings_info["480"].h264) {
          file = MEDIA_BASE + details.encodings_info["480"].h264.url;
        } else if (details.encodings_info && details.encodings_info["360"] && details.encodings_info["360"].h264) {
          file = MEDIA_BASE + details.encodings_info["360"].h264.url;
        } else if (details.original_media_url) {
          file = MEDIA_BASE + details.original_media_url;
        }

        return { ...video, file };
      } catch {
        return video;
      }
    }));

    res.render('feed', { videos: videosWithFiles, error: null });
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.render('feed', { videos: [], error: "Error loading videos." });
  }
});

module.exports = router;
