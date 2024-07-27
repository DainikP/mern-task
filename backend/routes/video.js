const express = require('express');
const router = express.Router();
const multer = require('multer');
const Video = require('../models/Video');
const path = require('path');
const fs = require('fs');

// Set up storage engine for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Route to upload a video
router.post('/upload', upload.single('video'), async (req, res) => {
    try {
        const { title, description } = req.body;
        const newVideo = new Video({
            title,
            description,
            path: req.file.path.replace(/\\/g, '/'),  // Replace backslashes with forward slashes
            thumbnail: req.body.thumbnail || '' // Handle optional thumbnail
        });
        await newVideo.save();
        res.status(201).json(newVideo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to fetch all videos
router.get('/', async (req, res) => {
    try {
        const videos = await Video.find();
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to fetch a single video by ID
router.get('/:id', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }
        res.json(video);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to serve video files
router.get('/video/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../uploads/videos/', req.params.filename);
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            return res.status(404).json({ message: 'File not found' });
        }
        res.sendFile(filePath);
    });
});

module.exports = router;
