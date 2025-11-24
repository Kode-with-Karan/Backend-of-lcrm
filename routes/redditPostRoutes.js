const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const RedditPostController = require("../controllers/redditPostController");

const router = express.Router();
router.basePath = "/api/reddit";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

/**
 * Route to handle image upload and OCR
 * POST /api/reddit/extract-text
 */
router.post(
  "/extract-text",
  upload.single("image"),
  RedditPostController.extractText
);

/**
 * Route to generate LinkedIn post from text content
 * POST /api/reddit/generate-linkedin-post
 */
router.post(
  "/generate-linkedin-post",
  RedditPostController.generateLinkedInPost
);

/**
 * Route to handle both image upload and LinkedIn post generation
 * POST /api/reddit/process-image-to-linkedin
 */
router.post(
  "/process-image-to-linkedin",
  upload.single("image"),
  RedditPostController.processImageToLinkedIn
);

/**
 * Health check route for Reddit post service
 * GET /api/reddit/health
 */
router.get("/health", RedditPostController.healthCheck);

module.exports = router;
