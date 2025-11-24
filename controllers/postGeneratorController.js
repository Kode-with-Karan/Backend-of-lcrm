const Post = require("../models/calendar/Calendar_post");
const rolePrompts = require("../data/rolePrompts");
const { chatCompletion } = require("../utils/openaiClient");

// Utility to extract hashtags
function extractHashtags(text) {
  return (text.match(/#\w+/g) || []).map((tag) => tag.toLowerCase());
}

// Utility to validate input
function validatePostInput(textInput, role, intent) {
  if (!textInput || typeof textInput !== 'string' || textInput.trim().length < 10) {
    return { valid: false, error: "Text input must be at least 10 characters long." };
  }
  
  if (!role || typeof role !== 'string') {
    return { valid: false, error: "Role is required and must be a string." };
  }
  
  if (!intent || typeof intent !== 'string') {
    return { valid: false, error: "Intent is required and must be a string." };
  }
  
  if (!rolePrompts[role]) {
    return { valid: false, error: `Invalid role. Available roles: ${Object.keys(rolePrompts).join(', ')}` };
  }
  
  return { valid: true };
}

// ------------------ Generate Post ------------------
const generatePost = async (req, res) => {
  try {
    const { textInput, role, intent, scheduledDate } = req.body;

    // Validate input
    const validation = validatePostInput(textInput, role, intent);
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false,
        error: validation.error 
      });
    }

    // Make scheduledDate optional for testing
    const testMode = !scheduledDate;
    const userId = req.user?._id || 'test-user-id';

    console.log("Role-based post generation triggered");

    const systemPrompt = generatePrompt(role, intent);

    const response = await chatCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: textInput.trim() },
    ]);

    const postContent = response.choices[0].message.content.trim();

    let newPost;
    if (testMode) {
      // Return post without saving to database for testing
      newPost = {
        title: postContent.substring(0, 60),
        content: postContent,
        theme: "Educational",
        scheduledDate: new Date(),
        scheduledTime: "10:00",
        userId: userId,
        status: "draft",
        generatedBy: "AI",
        createdAt: new Date(),
        _id: 'test-post-id'
      };
    } else {
      // Save to calendar for production
      newPost = await Post.create({
        title: postContent.substring(0, 60),
        content: postContent,
        theme: "Educational",
        scheduledDate: new Date(scheduledDate),
        scheduledTime: "10:00",
        userId: userId,
        status: "scheduled",
        generatedBy: "AI",
      });
    }

    return res.status(200).json({ 
      success: true,
      message: "Post generated successfully",
      post: newPost,
      wordCount: postContent.split(/\s+/).length,
      hashtags: extractHashtags(postContent)
    });
  } catch (error) {
    console.error("Error generating post:", error.message);
    
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
    
    return res.status(500).json({ 
      success: false,
      error: "Failed to generate post",
      code: "GENERATION_ERROR"
    });
  }
};

// ------------------ Fetch Posts ------------------
const fetchPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user._id }).sort({
      scheduledDate: 1,
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

// ------------------ Auto Generate Posts (stub) ------------------
const autoGeneratePosts = async (req, res) => {
  try {
    // placeholder logic
    res.status(200).json({ message: "Auto-generate posts not implemented yet" });
  } catch (error) {
    res.status(500).json({ error: "Failed to auto-generate posts" });
  }
};

// ------------------ Prompt Generator ------------------
function generatePrompt(role, intent) {
  return `
You are a skilled content strategist and LinkedIn ghostwriter. Your task is to turn raw topics or insights into a single, standalone, high-engagement post that feels human, story-driven, and non-templated.

Role: ${role}
Type: ${intent}
Role Guidelines: ${rolePrompts[role]}

Rules:

1. Word Count:
- Minimum 230 words. If under 230, regenerate.

2. Hooks:
- Start with a varied hook (story, stat, bold claim, etc).
- Do not reveal the insight in first 1–2 lines.

3. Structure:
- Mix components: hook, story, bullets, reflection, CTA.
- Vary line breaks.

4. Bullets:
- 1–5 bullets, position varies, style varies.

5. Tone & Style:
- Conversational, imperfect, witty, emotional.
- Use contractions.
- Avoid corporate jargon, AI phrases, emojis, markdown.

6. CTA:
- End with a specific/actionable CTA (not generic).

7. Output:
- Single unique post.
- Randomize hook, bullet count, structure.
- End with exactly 3 relevant hashtags.
`;
}

// ✅ export properly
module.exports = {
  generatePost,
  fetchPosts,
  autoGeneratePosts,
};
