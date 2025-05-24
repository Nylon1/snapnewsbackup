const express = require('express');
const router = express.Router();
const Content = require('../models/content');

// Get all pending videos
router.get('/admin/pending', async (req, res) => {
  try {
    const pendingVideos = await Content.find({ status: 'pending' }).sort({ createdAt: -1 }).lean();
    res.json(pendingVideos); // send to frontend
  } catch (err) {
    console.error('❌ Admin pending fetch error:', err.message);
    res.status(500).send('Failed to load pending content');
  }
});

// Approve a video
router.post('/admin/approve/:id', async (req, res) => {
  try {
    await Content.findByIdAndUpdate(req.params.id, { status: 'approved' });
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Approve error:', err.message);
    res.status(500).send('Failed to approve video');
  }
});

// Reject a video
router.post('/admin/reject/:id', async (req, res) => {
  try {
    await Content.findByIdAndUpdate(req.params.id, { status: 'rejected' });
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Reject error:', err.message);
    res.status(500).send('Failed to reject video');
  }
});

module.exports = router;
