const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const { chatCompletion } = require("../utils/openaiClient")

exports.generateRewrittenProfile = async (profileData, goal) => {
  const normalized = {
    Name: profileData.Name || "Information not available",
    Headline: profileData.Headline || "Information not available",
    About: profileData.About || "Information not available",
    Experience: profileData.Experience || "Information not available",
  };

  const prompt = `
You are a professional ghostwriter who specializes in turning LinkedIn profiles into authentic, engaging posts.
Your task is to create content that sounds like it is written directly by the profile owner, reflecting their experiences, voice, and perspective.

Instructions:
- Write in first person, as if the profile owner is speaking directly to their audience. The tone must feel personal, credible, and aligned with their role and achievements.
- Use the details of their profile — such as bio, work history, and positioning — as the foundation of the post. Do not copy from their About section; instead, use it as inspiration to create fresh, engaging content.
- Start with a hook that feels true to their personality. Expand in short paragraphs that highlight their insights, lessons, or reflections.
- If relevant, include 3–5 bullet points to share key takeaways, tips, or results in a clear format.
- Conclude with a natural, conversational call-to-action that invites readers to engage, reflect, or share their perspective.

Style Rules:
- Genuine, grounded, and human.
- Always use contractions.
- No emojis, no markdown formatting, no em dashes.
- Keep the language approachable while maintaining credibility.
- End with exactly three hashtags that fit the person’s positioning.

Output:
- A LinkedIn post between 200–300 words.
- A post that feels like the profile owner wrote it themselves — natural, confident, and true to their brand voice.

Profile to rewrite:
Name: ${normalized.Name}
Headline: ${normalized.Headline}
About: ${normalized.About}
Experience: ${normalized.Experience}

# Important:
Return the output **strictly in JSON** with three keys: "Headline", "About", "Experience".
Do not include any text outside the JSON.
{
  "Headline": "Transforming Negotiation into Results: My Journey and Insights",
  "About": "Negotiation is both an art and a science. I’ve spent years mastering it to create value for clients and organizations. From strategic communication to understanding human motivations, I focus on solutions that benefit everyone involved. I believe that success comes from collaboration, insight, and continuous learning.",
  "Experience": "Sales Executive: Led major client negotiations, boosting revenue by 25%. Marketing Specialist: Developed campaigns that increased brand engagement and client retention."
}



  `;

  try {
    const res = await chatCompletion([{ role: "user", content: prompt }] , { temperature: 0.7, max_tokens: 1500 });
    let rawOutput = res.choices?.[0]?.message?.content?.trim() || "";

    // Normalize common wrappers like ```json ... ``` and stray codefences/labels
    let cleaned = rawOutput
      .replace(/^```\s*json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    // If model wrapped JSON inside text, extract the first {...} JSON block
    if (!(cleaned.startsWith("{") && cleaned.endsWith("}"))) {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) cleaned = match[0];
    }

    try {
      const parsed = JSON.parse(cleaned);
      return parsed; // { Headline, About, Experience }
    } catch (err) {
      console.warn("[❌ JSON Parse Failed] Raw output:\n", rawOutput);
      return { error: "Invalid JSON from GPT", raw: rawOutput };
    }
  } catch (e) {
    console.error("[Rewriter Error]", e);
    return { error: "OpenAI API call failed", details: e.message };
  }
};