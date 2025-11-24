const express = require("express");
const router = express.Router();
const { chatCompletion } = require("../utils/openaiClient");

// Utility to extract hashtags
function extractHashtags(text) {
  return (text.match(/#\w+/g) || []).map((tag) => tag.toLowerCase());
}

// Utility to validate keyword
function validateKeyword(keyword) {
  if (!keyword || typeof keyword !== 'string') {
    return { valid: false, error: "Keyword must be a non-empty string." };
  }
  
  const trimmedKeyword = keyword.trim();
  if (trimmedKeyword.length < 2) {
    return { valid: false, error: "Keyword must be at least 2 characters long." };
  }
  
  if (trimmedKeyword.length > 100) {
    return { valid: false, error: "Keyword must be less than 100 characters." };
  }
  
  return { valid: true, keyword: trimmedKeyword };
}

// POST /generate — Generate 3 viral LinkedIn posts using OpenAI
router.post("/generate", async (req, res) => {
  try {
    const { keyword } = req.body;

    // Validate keyword
    const validation = validateKeyword(keyword);
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false,
        error: validation.error 
      });
    }

    const validatedKeyword = validation.keyword;

    const prompt = `You are a skilled content strategist. Your task is to turn a given raw topic or insight into standalone, high-engagement posts that feel human, story-driven, intimate, and entirely non-templated.

Generate exactly 3 original posts on the topic: "${validatedKeyword}"

Strict Content Rules
Rule 1: Word Count & Length

Each post must be a minimum of 250 words (spaces do not count).

Max length is capped at ∼700 tokens for brevity.

Rule 2: Hooks (Tension + Curiosity + Variation)

Start with a hook that grabs attention instantly and sparks curiosity so readers click "see more."

Never reveal the full insight in the first 1–2 lines.

Vary the hook style randomly across the 3 posts using a wide variety (e.g., personal story, failure, success, question, bold statement, statistic, metaphor, scenario, challenge, reflection, etc.).

Rule 3: Structure Variation

The post structure must vary randomly across all three posts.

Possible components include: Hook, Story or Insight, Bullets, Reflection, Lesson, and CTA. The order must differ each time.

Include natural line breaks to make the post visually readable on a social feed. Vary line breaks randomly (sometimes 2–3 lines, sometimes 3–4 lines) to improve visual rhythm and readability.

Rule 4: Bullets (1–5 per post)

Every post must include 1–5 bullet points.

Placement must be random: could appear at the start, middle, or end of the post.

Bullet style should vary: actionable, reflective, humorous, or metaphorical.

Use line breaks before and after bullets for clarity.

Rule 5: Tone, Intimacy, & Cadence (Anti-AI)

The tone must be conversational, human, story-led, and intimate (writing as if talking to one person).

Use contractions naturally (it's, you're, I've).

Allow for slight imperfections, wit, or emotion.

Vary sentence length and rhythm. Mix short fragments with longer flowing lines for a natural cadence.

Avoid corporate jargon, AI-like phrasing, over-formal writing, or forcing symmetry.

Rule 6: CTA (Call-to-Action)

End each post with one specific, relevant, and natural CTA.

It must flow directly from the post’s value and feel reflective or actionable—not generic or templated.

Avoid: "Please like and share," or "What do you think about this?"

Rule 7: Output Format & Constraints

Return 3 unique posts as a numbered list:

First post

Second post

Third post

Do not use emojis, decorative symbols, markdown (other than standard formatting like bolding or lists), or links.

Max 3 relevant and specific hashtags at the very end of each post, on a new line, with no text after. Avoid generic hashtags (e.g., #success, #motivation).`
;


    const response = await chatCompletion([
      {
        role: "user",
        content: prompt,
      },
    ]);

    const rawOutput = response.choices[0].message.content.trim();

    const generatedPosts = rawOutput
      .split(/\n(?=\d+\.\s)/) // split on "1. ", "2. ", etc.
      .map((post) => post.replace(/^\d+\.\s*/, "").trim())
      .filter((p) => p.length > 0);

    const formattedPosts = generatedPosts.map((text) => ({
      text,
      keyword: validatedKeyword,
      hashtags: extractHashtags(text),
      tone: "Viral",
      generatedAt: new Date().toISOString()
    }));

    res.status(200).json({
      success: true,
      message: "Fresh viral posts generated successfully.",
      posts: formattedPosts,
      count: formattedPosts.length,
      keyword: validatedKeyword
    });
  } catch (error) {
    console.error("Error generating posts:", error);
    
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
      error: "Failed to generate posts. Please try again.",
      code: "GENERATION_ERROR"
    });
  }
});

// GET route for testing with query parameters
router.get("/generate", async (req, res) => {
  try {
    const { keyword } = req.query;

    // Validate keyword
    const validation = validateKeyword(keyword);
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false,
        error: validation.error 
      });
    }

    const validatedKeyword = validation.keyword;

    const prompt = `You are a skilled content strategist. Your task is to turn a given raw topic or insight into standalone, high-engagement posts that feel human, story-driven, intimate, and entirely non-templated.

Generate exactly 3 original posts on the topic: "${validatedKeyword}"

Strict Content Rules
Rule 1: Word Count & Length

Each post must be a minimum of 250 words (spaces do not count).

Max length is capped at ∼700 tokens for brevity.

Rule 2: Hooks (Tension + Curiosity + Variation)

Start with a hook that grabs attention instantly and sparks curiosity so readers click "see more."

Never reveal the full insight in the first 1–2 lines.

Vary the hook style randomly across the 3 posts using a wide variety (e.g., personal story, failure, success, question, bold statement, statistic, metaphor, scenario, challenge, reflection, etc.).

Rule 3: Structure Variation

The post structure must vary randomly across all three posts.

Possible components include: Hook, Story or Insight, Bullets, Reflection, Lesson, and CTA. The order must differ each time.

Include natural line breaks to make the post visually readable on a social feed. Vary line breaks randomly (sometimes 2–3 lines, sometimes 3–4 lines) to improve visual rhythm and readability.

Rule 4: Bullets (1–5 per post)

Every post must include 1–5 bullet points.

Placement must be random: could appear at the start, middle, or end of the post.

Bullet style should vary: actionable, reflective, humorous, or metaphorical.

Use line breaks before and after bullets for clarity.

Rule 5: Tone, Intimacy, & Cadence (Anti-AI)

The tone must be conversational, human, story-led, and intimate (writing as if talking to one person).

Use contractions naturally (it's, you're, I've).

Allow for slight imperfections, wit, or emotion.

Vary sentence length and rhythm. Mix short fragments with longer flowing lines for a natural cadence.

Avoid corporate jargon, AI-like phrasing, over-formal writing, or forcing symmetry.

Rule 6: CTA (Call-to-Action)

End each post with one specific, relevant, and natural CTA.

It must flow directly from the post's value and feel reflective or actionable—not generic or templated.

Avoid: "Please like and share," or "What do you think about this?"

Rule 7: Output Format & Constraints

Return 3 unique posts as a numbered list:

First post

Second post

Third post

Do not use emojis, decorative symbols, markdown (other than standard formatting like bolding or lists), or links.

Max 3 relevant and specific hashtags at the very end of each post, on a new line, with no text after. Avoid generic hashtags (e.g., #success, #motivation).`;

    const response = await chatCompletion([
      {
        role: "user",
        content: prompt,
      },
    ]);

    const rawOutput = response.choices[0].message.content.trim();

    const generatedPosts = rawOutput
      .split(/\n(?=\d+\.\s)/) // split on "1. ", "2. ", etc.
      .map((post) => post.replace(/^\d+\.\s*/, "").trim())
      .filter((p) => p.length > 0);

    const formattedPosts = generatedPosts.map((text) => ({
      text,
      keyword: validatedKeyword,
      hashtags: extractHashtags(text),
      tone: "Viral",
      generatedAt: new Date().toISOString()
    }));

    res.status(200).json({
      success: true,
      message: "Fresh viral posts generated successfully.",
      posts: formattedPosts,
      count: formattedPosts.length,
      keyword: validatedKeyword
    });
  } catch (error) {
    console.error("Error generating posts:", error);
    
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
      error: "Failed to generate posts. Please try again.",
      code: "GENERATION_ERROR"
    });
  }
});

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Viral Post Search API is healthy",
    timestamp: new Date().toISOString(),
    endpoints: {
      "POST /generate": "Generate viral posts with keyword in request body",
      "GET /generate": "Generate viral posts with keyword as query parameter",
      "GET /health": "Health check endpoint"
    }
  });
});

// Get API info endpoint
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Viral Post Search API",
    description: "Create compelling LinkedIn content that drives engagement and grows your professional network",
    version: "1.0.0",
    endpoints: {
      "POST /api/viralpost/generate": {
        description: "Generate 3 viral LinkedIn posts",
        method: "POST",
        body: { keyword: "string (required)" },
        example: 'curl -X POST http://localhost:3002/api/viralpost/generate -H "Content-Type: application/json" -d \'{"keyword": "startup tips"}\''
      },
      "GET /api/viralpost/generate": {
        description: "Generate 3 viral LinkedIn posts",
        method: "GET",
        query: { keyword: "string (required)" },
        example: 'curl "http://localhost:3002/api/viralpost/generate?keyword=startup%20tips"'
      },
      "GET /api/viralpost/health": {
        description: "Health check",
        method: "GET",
        example: 'curl "http://localhost:3002/api/viralpost/health"'
      }
    }
  });
});

module.exports = router;
