// routes/watchRoute.js
const express = require('express');
const router  = express.Router();

router.get('/watch/:id', async (req, res) => {
  // 1) Log that the route was hit and print the token
  console.log('>>> HIT /watch/:id with', req.params.id);
  const token = req.params.id;

  try {
    // 2) Fetch the video JSON
    const apiUrl = `https://mediacms-cw-u46015.vm.elestio.app/api/v1/media/${token}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return res.status(404).render('404', { message: 'Snap not found' });
    }

    // 3) Parse JSON and log its contents
    const video = await response.json();
    console.log('>>> VIDEO JSON:', video);

    // 4) Finally render EJS with that video object
    return res.render('watch', { video });
  } catch (error) {
    console.error('Error fetching video:', error);
    return res.status(500).render('404', { message: 'Server error' });
  }
});

module.exports = router;
