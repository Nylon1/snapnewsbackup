const express = require('express');
const router = express.Router();

// Native fetch in Node 18+!
router.get('/', async (req, res) => {
  try {
    const response = await fetch('https://mediacms-cw-u46015.vm.elestio.app/api/v1/media/');
    if (!response.ok) throw new Error(`MediaCMS returned ${response.status}`);
    const data = await response.json();
    const now = new Date();

    // Only get public videos from the last 24 hours
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
        // Try to find the direct file property (it may be called 'file', 'video_file', or similar)
        // Look for mp4 in any field
        let file = details.file || details.video_file || details.original_file || null;
        // Fallback: find the first property with '.mp4' in the value
        if (!file) {
          for (const v of Object.values(details)) {
            if (typeof v === 'string' && v.endsWith('.mp4')) {
              file = v;
              break;
            }
          }
        }
        return { ...video, file };
      } catch {
        return video; // fallback: video with no file
      }
    }));

    res.render('feed', { videos: videosWithFiles, error: null });
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.render('feed', { videos: [], error: "Error loading videos." });
  }
});

module.exports = router;
