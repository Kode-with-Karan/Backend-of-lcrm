const express = require("express");
const auth = require("../middleware/auth");
const {
  generatePost,
  autoGeneratePosts,
  fetchPosts,
} = require("../controllers/postGeneratorController");

const router = express.Router();

// Authenticated routes
router.post("/generate-post", auth, generatePost);
router.post("/autoGenerate", auth, autoGeneratePosts);
router.get("/posts", auth, fetchPosts);

// Non-authenticated routes for testing
router.post("/test-generate", generatePost);
router.get("/test-posts", fetchPosts);

// Health check and API info
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Post Generator API is healthy",
    timestamp: new Date().toISOString(),
    endpoints: {
      "POST /api/post/generate-post": "Generate post with authentication",
      "POST /api/post/test-generate": "Generate post without authentication (testing)",
      "GET /api/post/posts": "Fetch posts with authentication",
      "GET /api/post/test-posts": "Fetch posts without authentication (testing)",
      "GET /api/post/health": "Health check"
    }
  });
});

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Post Generator API",
    description: "Generate custom posts tailored to your audience with advanced AI personalization",
    version: "1.0.0",
    endpoints: {
      "POST /api/post/generate-post": {
        description: "Generate AI-powered LinkedIn post",
        method: "POST",
        auth: "Required",
        body: {
          textInput: "string (required)",
          role: "string (required) - Available: Founders, SaaS/AI Founders, Ghostwriters, Company Owners, Freelancers",
          intent: "string (required) - Available: Story, Insight, CTA, Tip, Lesson, Update",
          scheduledDate: "string (optional) - ISO date string"
        },
        example: 'curl -X POST http://localhost:3002/api/post/generate-post -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" -d \'{"textInput": "LLM, Deep learning, Neural networks", "role": "Founders", "intent": "Story"}\''
      },
      "POST /api/post/test-generate": {
        description: "Generate AI-powered LinkedIn post (no auth required for testing)",
        method: "POST",
        auth: "Not required",
        body: {
          textInput: "string (required)",
          role: "string (required)",
          intent: "string (required)"
        },
        example: 'curl -X POST http://localhost:3002/api/post/test-generate -H "Content-Type: application/json" -d \'{"textInput": "LLM, Deep learning, Neural networks", "role": "Founders", "intent": "Story"}\''
      },
      "GET /api/post/health": {
        description: "Health check",
        method: "GET",
        example: 'curl "http://localhost:3002/api/post/health"'
      }
    }
  });
});

module.exports = router;
