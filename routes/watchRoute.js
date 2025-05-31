const express = require('express');
const router = express.Router();

// Uncomment next line if your Node version is <18
// const fetch = require('node-fetch');

router.get('/watch/:id', async (req, res) => {
  const token = req.params.id;
  try {
    const apiUrl = `https://mediacms-cw-u46015.vm.elestio.app/api/v1/media/${token}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      // Video not found
      return res.status(404).render('404', { message: 'Snap not found' });
    }
    const video = await response.json();
    console.log("📦 FETCHED VIDEO OBJECT:", video);

    res.render('watch', { video });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).render('404', { message: 'Server error' });
  }
});

module.exports = router;
