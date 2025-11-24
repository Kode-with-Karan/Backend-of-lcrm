
// async function generatePostForProfile(username, topic) {
//   const profile = await LinkedInProfile.findOne({ username });
//   if (!profile || profile.posts.length === 0) return null;

//   const sample = profile.posts.slice(0, 5).map((p, i) =>
//     `Post ${i + 1}:
// Text: ${p.text}
// Tone: ${p.tone}
// Hashtags: ${p.hashtags.join(', ') || 'None'}
// Formatting: Bullets-${p.formatting.bullets}, Emojis-${p.formatting.emojis}`
//   ).join('\n\n');

//   const sigPrompt = `Based on these LinkedIn posts by ${username}, extract their post-writing signature and return JSON with keys: Tone, Format, Language Model, Hashtags. Respond only with valid JSON:
// ${sample}`;

//   const sigRes = await openai.chat.completions.create({
//     model: 'gpt-4',
//     messages: [{ role: 'user', content: sigPrompt }],
//     temperature: 0.6,
//     max_tokens: 800
//   });

//   let signature;
//   const signatureText = sigRes.choices[0].message.content.trim();

//   try {
//     signature = JSON.parse(signatureText);
//   } catch (err) {
//     console.error('❌ Failed to parse OpenAI signature JSON:', err.message);
//     console.log('⚠️ Received content:', signatureText);

//     // Optionally: fallback or return error
//     return { error: 'OpenAI returned non-JSON signature content.', raw: signatureText };
//   }

//   const postPrompt = `Write a LinkedIn post on "${topic}" in the style defined by the signature:
// Tone: ${signature.Tone}
// Format: ${signature.Format}
// Language Model: ${signature["Language Model"]}
// Hashtags: ${signature.Hashtags}`;

//   const postRes = await openai.chat.completions.create({
//     model: 'gpt-4',
//     messages: [{ role: 'user', content: postPrompt }],
//     temperature: 0.7,
//     max_tokens: 400
//   });

//   return {
//     signature,
//     generatedPost: postRes.choices[0].message.content.trim()
//   };
// }


// async function generateFromManualInput(inputText, topic, tone, copyPercent) {
//   const trimmedText = inputText.length > 800 ? inputText.slice(0, 800) : inputText;
//   const copyRatio = Math.max(0, Math.min(copyPercent, 100)) / 100;

//   const prompt = `
// You are a professional LinkedIn ghostwriter. The user has provided a LinkedIn post. Rewrite it based on a new topic while partially retaining the original writing style.

// Original Post (for reference):
// "${trimmedText}"

// Instructions:
// - Create a new LinkedIn post on the topic: "${topic}"
// - Retain approximately ${copyPercent}% of the style/content structure.
// - Use the tone: "${tone}"
// - Do NOT copy word-for-word; adapt the feel and format.
// - Avoid including likes, shares, or comment references.

// Return only the final post content (max 150 words).
// `;

//   const postRes = await openai.chat.completions.create({
//     model: 'gpt-4',
//     messages: [{ role: 'user', content: prompt }],
//     temperature: 0.7,
//     max_tokens: 500
//   });

//   return {
//     generatedPost: postRes.choices[0].message.content.trim()
//   };
// }
const { chatCompletion } = require('../utils/openaiClient');

function generatePrompt(referencePost, goal, tone, copyRatio) {
  return `
You are a skilled content strategist and ghostwriter. Your task is to rewrite the reference LinkedIn post into a single, high-engagement post that is human, story-driven, and non-templated. The post must strictly follow these rules:

1. **Word Count**:
- Minimum 230 words. Posts under 230 words are invalid and must be regenerated until they exceed the limit.

2. **Hooks**:
- Start with a hook that grabs attention. Vary using personal story, failure, success, question, bold statement, statistic, metaphor, scenario, challenge, etc.
- Never reveal the full insight in the first 1–2 lines.

3. **Structure**:
- Components can include hook, story/insight, bullets, reflection, lesson, or CTA—but order should differ.
- Line breaks must vary randomly (sometimes 2–3 lines, sometimes 3–4 lines).

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

- Goal: ${goal}
- Tone: ${tone}
- Copy ratio: ${copyRatio * 100}%

Reference Post:
${referencePost}

Strategic Goal:
${goal}

7. **Output**:
- Generate a single, unique post between 230–300 words.
- Randomize hook style, bullet count & placement, line breaks, and overall structure for maximum variation.
- End with exactly three relevant hashtags.
`;
}

async function generateFromMultipleInputs(posts, topic, tone, copyPercent) {
  const copyRatio = Math.max(0, Math.min(copyPercent, 100)) / 100;

  if (!Array.isArray(posts) || posts.length === 0) {
    throw new Error('No posts provided');
  }

  const trimmedPosts = posts
    .slice(0, 5)
    .map((text, index) => `Post ${index + 1}:\n"${text?.toString()?.slice(0, 500) || ''}"`)
    .join('\n\n');

  const prompt = generatePrompt(trimmedPosts, topic, tone, copyRatio);

  const result = await chatCompletion(
    [
      { role: "system", content: "You are a professional LinkedIn content strategist." },
      { role: "user", content: prompt }
    ],
    { temperature: 0.7, max_tokens: 1500 }
  );

  const generatedPost = result?.choices?.[0]?.message?.content?.trim();
  if (!generatedPost) throw new Error('No content generated');

  return { generatedPost };
}

module.exports = { generateFromMultipleInputs };
