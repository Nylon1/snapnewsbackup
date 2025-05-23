const express = require('express');
const router = express.Router();
const Trending = require('../models/Trending');

// GET /public/trending
router.get('/trending', async (req, res) => {
  try {
    const trending = await Trending.find().sort({ createdAt: -1 });
    res.json(trending);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trending videos.' });
  }
});

module.exports = router;
