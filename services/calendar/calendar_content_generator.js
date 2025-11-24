const { chatCompletion } = require("../../utils/openaiClient");
const ContentTemplates = require("./calendar_content_template");

class ContentGenerator {
  constructor() {
    this.themes = {
      Educational: {
        prompt:
          "Write an educational LinkedIn post that teaches something valuable about {topic}. Include actionable insights and end with a thought-provoking question.",
        hashtags: ["#Learning", "#Education", "#ProfessionalDevelopment"],
        optimalTimes: ["09:00", "14:00", "16:00"],
        expectedEngagement: { likes: 25, comments: 8, shares: 3 },
      },
      "Personal Story": {
        prompt:
          "Write a personal story LinkedIn post about {topic}. Share a lesson learned, make it relatable, and inspire others with the journey.",
        hashtags: ["#PersonalGrowth", "#Entrepreneurship", "#Lessons"],
        optimalTimes: ["08:00", "19:00", "20:00"],
        expectedEngagement: { likes: 45, comments: 15, shares: 8 },
      },
      Insight: {
        prompt:
          "Write an insightful LinkedIn post sharing a key observation about {topic}. Provide data or examples to support your point.",
        hashtags: ["#Insights", "#BusinessTips", "#Industry"],
        optimalTimes: ["10:00", "15:00", "17:00"],
        expectedEngagement: { likes: 30, comments: 10, shares: 5 },
      },
      Question: {
        prompt:
          "Write a LinkedIn post that poses an engaging question about {topic}. Encourage discussion and community engagement.",
        hashtags: ["#Discussion", "#Community", "#Networking"],
        optimalTimes: ["11:00", "13:00", "18:00"],
        expectedEngagement: { likes: 20, comments: 25, shares: 2 },
      },
      CTA: {
        prompt:
          "Write a LinkedIn post about {topic} that includes a clear call-to-action. Drive engagement or conversions naturally.",
        hashtags: ["#CallToAction", "#Engagement", "#Business"],
        optimalTimes: ["09:00", "14:00", "16:00"],
        expectedEngagement: { likes: 35, comments: 12, shares: 6 },
      },
      Tips: {
        prompt:
          "Write a LinkedIn post sharing 3-5 practical tips about {topic}. Make them actionable and easy to implement.",
        hashtags: ["#Tips", "#Productivity", "#Success"],
        optimalTimes: ["08:00", "12:00", "15:00"],
        expectedEngagement: { likes: 40, comments: 18, shares: 10 },
      },
      "Industry News": {
        prompt:
          "Write a LinkedIn post commenting on recent developments in {topic}. Provide your unique perspective and analysis.",
        hashtags: ["#News", "#Industry", "#Analysis"],
        optimalTimes: ["07:00", "13:00", "17:00"],
        expectedEngagement: { likes: 28, comments: 14, shares: 7 },
      },
    };

    this.lengthPreferences = {
      short: { maxChars: 500, style: "concise and punchy" },
      medium: { maxChars: 1000, style: "balanced and informative" },
      long: { maxChars: 2000, style: "detailed and comprehensive" },
    };

    this.toneAdjustments = {
      Professional: "formal, authoritative tone",
      Casual: "relaxed, friendly tone",
      Inspirational: "motivating, uplifting tone",
      Educational: "informative, teaching tone",
      Humorous: "light-hearted, witty tone",
      Authoritative: "expert, confident tone",
      Conversational: "dialogue-like, engaging tone",
      Motivational: "energizing, action-oriented tone",
    };
  }

  async generatePost(theme, topic, userPreferences = {}) {
    try {
      console.log(`Generating post for theme: ${theme}, topic: ${topic}`);
      const themeConfig = this.themes[theme];
      if (!themeConfig) {
        throw new Error(`Unknown theme: ${theme}`);
      }

      const lengthConfig =
        this.lengthPreferences[
          userPreferences.contentPreferences?.preferredPostLength || "medium"
        ];

      const res = await chatCompletion(
        [
          {
            role: "user",
            content: this.generatePrompt(topic, theme, userPreferences),
          },
        ],
        {
          max_tokens: this.calculateMaxTokens(lengthConfig.maxChars),
          temperature: userPreferences.generationSettings?.creativityLevel || 0.7,
        }
      );

      const content = res.choices[0].message.content.trim();

      const hashtags = this.generateHashtags(topic, theme, userPreferences);
      const aiConfidence = this.calculateAIConfidence(content, userPreferences);
      const performancePrediction = this.predictPerformance(content, theme, userPreferences);

      console.log(`Generated content for ${theme}: ${content.substring(0, 100)}...`);

      return {
        content,
        hashtags,
        theme,
        topic,
        aiConfidence,
        performancePrediction,
        contentLength: content.length,
        readabilityScore: this.calculateReadabilityScore(content),
        suggestedTimes: themeConfig.optimalTimes,
        expectedEngagement: themeConfig.expectedEngagement,
      };
    } catch (error) {
      console.error("Error generating post:", error);
      throw new Error(`Failed to generate post: ${error.message}`);
    }
  }

  async generateMultiplePosts(topics, userPreferences = {}) {
    const posts = [];
    const numberOfPosts = topics.length;
    
    // Generate one post per topic with varied themes
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      const themes = Object.keys(this.themes);
      const theme = themes[i % themes.length]; // Cycle through themes
      
      try {
        const post = await this.generatePost(theme, topic, userPreferences);
        posts.push(post);
      } catch (err) {
        console.error(`Error generating post for topic "${topic}" and theme "${theme}": ${err.message}`);
        // Continue with other posts even if one fails
      }
    }
    return posts;
  }

  generatePrompt(topic, theme, userPreferences) {
    const numberOfPosts = 1; // Since we're generating one post at a time
    return `
You are a professional LinkedIn content strategist and ghostwriter.
Your mission is to design and generate a complete content plan.

You must generate exactly ${numberOfPosts} LinkedIn post.

Each post should be 200-300 words.

Use contractions throughout to keep the tone conversational.
Vary sentence length to create rhythm.
Keep paragraphs short (2-3 lines maximum).
If a point works better as a list, use 3-5 bullet points for clarity.
Every post must end with a natural, conversational call-to-action that invites replies, plus exactly 3 specific hashtags.

Content Framework (for structuring the posts):
- Story - Share a personal or client-based narrative with a turning point. Highlight the lessons. End with reflection.
- Insight - Deliver a counter-intuitive or surprising insight. Challenge assumptions. Build reasoning in short paragraphs.
- CTA Post - Motivational and action-driven. Start with a pain-point question. Build energy. Provide 3-5 benefits in bullet points. Conclude with a clear call-to-action.
- Tip / How-To - Share a practical, actionable tactic. Frame the common problem. Offer 3-5 step-by-step bullets. Encourage readers to try it.
- Lesson Learned - Be candid about a mistake or challenge. Share what went wrong, then list 3-5 lessons learned. End with a forward-looking statement.
- Update / News - Announce progress, milestones, or launches. Give context. Use 3-5 bullets to summarize impacts. Credit the team or collaborators.
- Reflection - Write a thoughtful, slower-paced post. Explore a big idea, mindset shift, or perspective. Conclude with an open-ended question.

Style rules:
Warm, natural, and human.
No emojis, markdown formatting, or em dashes.
Avoid generic corporate language. Every sentence must have purpose.
Posts should sound like conversations with smart peers, not corporate press releases.

Output:
- Generate exactly ${numberOfPosts} post.
- Clearly label it as "Post 1".
- The post should be distinct in angle and type, but unified in tone, voice, and quality.

Topic: "${topic}"
Theme: "${theme}"
User Preferences: ${JSON.stringify(userPreferences)}
`;
  }


  calculateMaxTokens(maxChars) {
    return Math.min(Math.ceil(maxChars / 4) + 100, 800);
  }

  generateHashtags(topic, theme, userPreferences) {
    const themeConfig = this.themes[theme];
    return themeConfig.hashtags || [];
  }

  calculateAIConfidence(content, userPreferences) {
    // Mocked confidence score, can later implement real analysis
    return Math.random() * 100;
  }

  predictPerformance(content, theme, userPreferences) {
    const base = this.themes[theme].expectedEngagement;
    return {
      likes: Math.floor(base.likes * (0.8 + Math.random() * 0.4)),
      comments: Math.floor(base.comments * (0.8 + Math.random() * 0.4)),
      shares: Math.floor(base.shares * (0.8 + Math.random() * 0.4)),
    };
  }

  calculateReadabilityScore(content) {
    return Math.min(100, Math.max(0, 100 - content.length / 20));
  }
}

module.exports = new ContentGenerator();
