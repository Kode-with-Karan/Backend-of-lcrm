const express = require('express');
const dotenv = require('dotenv');
const goalPrompts = require('../data/goalPrompts'); 
const { chatCompletion } = require('../utils/openaiClient');

dotenv.config();

const router = express.Router();

// List available strategic goals for easy client discovery
router.get('/goals', (req, res) => {
  try {
    const goals = Object.keys(goalPrompts);
    res.json({ goals });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load goals' });
  }
});

// Generate a post for a given goal + idea
router.post('/generate', async (req, res) => {
  const { goal, idea } = req.body;

  if (!goalPrompts[goal]) {
    return res.status(400).json({ error: "Invalid or missing strategic goal" });
  }

  if (!idea) {
    return res.status(400).json({ error: "Missing post topic or idea" });
  }

  const prompt = generatePrompt(goal, idea);

  try {
    let post = '';
    let wordCount = 0;
    let attempts = 0;

    const MIN_WORDS = 230;
    const MAX_ATTEMPTS = 8;

    while (wordCount < MIN_WORDS && attempts < MAX_ATTEMPTS) {
      const completion = await chatCompletion(
        [{ role: "user", content: prompt }],
        { temperature: 0.7, max_tokens: 900 }
      );
      post = (completion.choices[0]?.message?.content || '').trim();
      // strip common code fences if model returns them
      post = post.replace(/^```[a-zA-Z]*\n?/, '').replace(/```\s*$/, '');
      wordCount = post.split(/\s+/).filter(Boolean).length;
      attempts++;
    }

    if (wordCount < MIN_WORDS) {
      return res.status(500).json({ 
        error: `Failed to generate post with minimum ${MIN_WORDS} words after ${attempts} attempts.` 
      });
    }

    res.json({ post, wordCount });
  } catch (err) {
    console.error("OpenAI Error.", err);
    res.status(500).json({ error: "Failed to generate post" });
  }
});

module.exports = router;

function generatePrompt(goal, idea){
  return `
You are a skilled content strategist. Your task is to turn raw topics or insights into a single, standalone, high-engagement post that feels human, story-driven, and non-templated. The post must strictly follow these rules:

1. **Word Count**:
- The post must be a minimum of 230 words. Posts should b generated and must be regenerated until they exceed the limit.

2. **Hooks**:
- Start with a hook that grabs attention. Vary using personal story, failure, success, question, bold statement, statistic, metaphor, scenario, challenge, etc.
- Never reveal the full insight in the first 1–2 lines.

3. **Structure**:
- Components can include hook, story/insight, bullets, reflection, lesson, or CTA—but order should differ.
- Line breaks should vary (sometimes 2–3 lines, sometimes 3–4 lines).

4. **Bullets**:
- Include 1–5 bullet points.
- Placement must vary: beginning, middle, or end.
- Bullet style should vary: actionable, reflective, humorous, metaphorical, etc.

5. **Tone & Style**:
- Conversational, human, story-led.
- Imperfections, wit, or emotions allowed.
- Use contractions naturally (it’s, you’re, I’ve).
- Avoid corporate jargon, AI-like phrasing, emojis, markdown, or over-formal writing.

6. **CTA**:
- End with a specific, reflective, or actionable call-to-action.
- Avoid generic or templated lines.

7. **Output**:
- Return a single, unique post.
- Randomize hook style, bullet count & placement, line breaks, and overall structure for maximum variation.

Reference Post:
${idea}

Strategic Goal:
${goal}
`
}
