const fs = require('fs');
const path = require('path');
const transcribeAudio = require('../utils/transcribeAudio');
const { chatCompletion } = require('../utils/openaiClient');

exports.processVoiceNote = async (req, res) => {
  const { intent = "Story" } = req.body;
  const audioFile = req.file;

  if (!audioFile) {
    return res.status(400).json({ error: 'Audio file is missing' });
  }

  const filePath = path.join(__dirname, '..', 'uploads', audioFile.filename);

  try {
    // Step 1: Transcribe audio
    const transcript = await transcribeAudio(filePath);

    // Step 2: Generate post with 230+ words, story-driven, human, randomized bullets & hooks
    let post = "";
    let wordCount = 0;
    let attempts = 0;

    while (wordCount < 230 && attempts < 5) {
      const prompt = `
You are a skilled content strategist. Your task is to turn raw voice note transcripts into a single, standalone, high-engagement LinkedIn post that feels human, story-driven, and non-templated. The post must strictly follow these rules:

1. Word Count: Minimum 230 words. Regenerate until the post exceeds this limit.
2. Hooks: Start with a hook that grabs attention. Vary using personal story, failure, success, question, bold statement, statistic, metaphor, scenario, challenge, etc. Never reveal the full insight in the first 1–2 lines.
3. Structure: Components can include hook, story/insight, bullets, reflection, lesson, or CTA—but order should differ. Line breaks must vary randomly (2–3 lines or 3–4 lines).
4. Bullets: Include 1–5 bullets. Placement and style must vary: beginning, middle, end; actionable, reflective, humorous, metaphorical, etc.
5. Tone & Style: Conversational, human, story-led. Use contractions naturally. Avoid corporate jargon, emojis, markdown, or over-formal writing.
6. CTA: End with a specific, reflective, or actionable call-to-action.
7. Output: Single, unique post with random hook style, bullet count & placement, line breaks, and overall structure variation.

Transcript:
"${transcript}"

Tone:
${intent}
`;

      const response = await chatCompletion([
        { role: "user", content: prompt }
      ], { temperature: 0.7, max_tokens: 1500 });

      post = response.choices[0].message.content.trim();
      wordCount = post.split(/\s+/).length;
      attempts++;
    }

    if (wordCount < 230) {
      return res.status(500).json({ 
        error: `Failed to generate post with minimum 230 words after ${attempts} attempts.` 
      });
    }

    // Optional: delete file after processing
    fs.unlinkSync(filePath);

    return res.status(200).json({ transcript, post, wordCount });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: 'Failed to process voice note' });
  }
};
