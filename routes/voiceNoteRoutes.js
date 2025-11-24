const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { processVoiceNote } = require('../controllers/voiceNoteController');

const router = express.Router();

// Ensure uploads directory exists (use absolute path relative to project root)
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, `audio_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

router.post('/upload', upload.single('audio'), processVoiceNote);

module.exports = router;
