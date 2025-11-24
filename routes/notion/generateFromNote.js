const express = require("express");
const User = require("../../models/notion/Notion_user");
const AIService = require("../../services/notion/aiService");
const router = express.Router();

// Utility to validate input
function validateNotionInput(content, tone, goal) {
  if (!content || typeof content !== 'string' || content.trim().length < 10) {
    return { valid: false, error: "Content must be at least 10 characters long." };
  }
  
  const validTones = ["storytelling", "educational", "inspirational", "professional", "conversational"];
  if (tone && !validTones.includes(tone)) {
    return { valid: false, error: `Invalid tone. Available tones: ${validTones.join(', ')}` };
  }
  
  const validGoals = ["engagement", "leads", "authority", "network"];
  if (goal && !validGoals.includes(goal)) {
    return { valid: false, error: `Invalid goal. Available goals: ${validGoals.join(', ')}` };
  }
  
  return { valid: true };
}

router.post("/", async (req, res) => {
  try {
    const {
      userId,
      content,
      tone = "storytelling",
      goal = "engagement",
    } = req.body;

    // Validate input
    const validation = validateNotionInput(content, tone, goal);
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false,
        error: validation.error 
      });
    }

    // Check if OpenAI API key is loaded
    console.log("OpenAI API Key available:", !!process.env.OPENAI_API_KEY);
    console.log("OpenAI API Key length:", process.env.OPENAI_API_KEY?.length);

    const aiService = new AIService();
    const result = await aiService.convertToLinkedInPost(content, tone, goal);

    res.json({
      success: true,
      message: "Notion note converted to LinkedIn post successfully",
      generatedPost: result.post,
      wordCount: result.wordCount,
      originalContent: content,
      tone,
      goal,
      hashtags: extractHashtags(result.post)
    });
  } catch (error) {
    console.error("Post generation error:", error);
    
    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return res.status(503).json({ 
        success: false,
        error: "Service temporarily unavailable. Please try again later.",
        code: "QUOTA_EXCEEDED"
      });
    }
    
    if (error.code === 'rate_limit_exceeded') {
      return res.status(429).json({ 
        success: false,
        error: "Rate limit exceeded. Please wait before making another request.",
        code: "RATE_LIMIT"
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: error.message,
      code: "GENERATION_ERROR"
    });
  }
});

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Notion to Post API is healthy",
    timestamp: new Date().toISOString(),
    availableTones: ["storytelling", "educational", "inspirational", "professional", "conversational"],
    availableGoals: ["engagement", "leads", "authority", "network"]
  });
});

// API info endpoint
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Notion to Post API",
    description: "Convert Notion notes to LinkedIn posts using AI",
    version: "1.0.0",
    endpoints: {
      "POST /api/generateFromNote/": {
        description: "Convert Notion note to LinkedIn post",
        method: "POST",
        body: {
          userId: "string (optional)",
          content: "string (required) - Note content",
          tone: "string (optional) - Default: storytelling",
          goal: "string (optional) - Default: engagement"
        },
        example: 'curl -X POST http://localhost:3002/api/generateFromNote/ -H "Content-Type: application/json" -d \'{"content": "AI tools are revolutionizing business", "tone": "educational", "goal": "engagement"}\''
      },
      "GET /api/generateFromNote/health": {
        description: "Health check",
        method: "GET",
        example: 'curl "http://localhost:3002/api/generateFromNote/health"'
      }
    }
  });
});

// Utility to extract hashtags
function extractHashtags(text) {
  return (text.match(/#\w+/g) || []).map((tag) => tag.toLowerCase());
}

module.exports = router;
