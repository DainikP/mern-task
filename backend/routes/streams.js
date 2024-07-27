const express = require('express');
const router = express.Router();
const Stream = require('../models/Stream');

// Start a new stream
router.post('/start', async (req, res) => {
    const { streamId, title } = req.body;
    try {
        let stream = await Stream.findOne({ streamId });
        if (!stream) {
            stream = new Stream({ streamId, title });
            await stream.save();
        } else {
            stream.isActive = true;
            await stream.save();
        }
        res.status(200).json(stream);
    } catch (err) {
        res.status(500).json({ error: 'Failed to start stream' });
    }
});

// Stop a stream
router.post('/stop', async (req, res) => {
    const { streamId } = req.body;
    try {
        const stream = await Stream.findOne({ streamId });
        if (stream) {
            stream.isActive = false;
            await stream.save();
        }
        res.status(200).json({ message: 'Stream stopped' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to stop stream' });
    }
});

// Get all active streams
router.get('/', async (req, res) => {
    try {
        const streams = await Stream.find({ isActive: true });
        res.status(200).json(streams);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch streams' });
    }
});

module.exports = router;
