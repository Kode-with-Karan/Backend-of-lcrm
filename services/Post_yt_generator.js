const { chatCompletion } = require("../utils/openaiClient");

async function generateLinkedInPost(topic, tone = "educational") {
  const prompt = generatePrompt(topic, tone);

  try {
    let post = '';
    let wordCount = 0;
    let attempts = 0;

    // Retry until word count >= 230 or max 5 attempts
    while (wordCount < 230 && attempts < 5) {
      const response = await chatCompletion([{ role: "user", content: prompt }]);
      post = response.choices[0]?.message?.content.trim();
      wordCount = post.split(/\s+/).length;
      attempts++;
    }

    if (wordCount < 230) {
      throw new Error(`Failed to generate post with minimum 230 words after ${attempts} attempts.`);
    }

    // Extract hashtags
    const hashtags = post.match(/#\w+/g) || [];

    // Infer tone
    const inferredTone = post.includes("🔥") || post.includes("👇") ? "story" : tone;

    return {
      post,
      metadata: {
        hashtags,
        tone: inferredTone,
        length: wordCount,
      },
    };
  } catch (err) {
    console.error("OpenAI Error.", err);
    throw err;
  }
}

function generatePrompt(topic, tone) {
  return `
You are a skilled content strategist. Your task is to turn the transcripts into a single, standalone, high-engagement post that feels human, story-driven, and non-templated. The post must strictly follow these rules:

1. **Word Count**:
- The post must be a minimum of 230 words. Posts under 230 words are invalid and must be regenerated until they exceed the limit.

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

Topic:
${topic}

Tone:
${tone}
`;
}

module.exports = { generateLinkedInPost };

