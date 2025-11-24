const Tesseract = require("tesseract.js");
const fs = require("fs");
const openai = require("../utils/openaiClient");

/**
 * RedditPost Service
 * Handles image OCR and LinkedIn post generation from Reddit posts
 */
class RedditPostService {
  /**
   * Extract text from image using Tesseract OCR
   * @param {string} imagePath - Path to the image file
   * @returns {Promise<string>} - Extracted text from the image
   */
  async extractTextFromImage(imagePath) {
    try {
      console.log("Starting OCR process for:", imagePath);

      const {
        data: { text },
      } = await Tesseract.recognize(imagePath, "eng", {
        logger: (m) => console.log(m),
      });

      const cleanedText = text.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();

      console.log("OCR completed successfully");
      return cleanedText;
    } catch (error) {
      console.error("OCR Error:", error);
      throw new Error("Failed to extract text from image");
    }
  }

  /**
   * Generate LinkedIn post using OpenAI API
   * @param {string} content - Content to convert to LinkedIn post
   * @returns {Promise<string>} - Generated LinkedIn post
   */
  async generateLinkedInPost(content) {
    try {
      if (!openai) {
        throw new Error(
          "OpenAI client not initialized. Please check your API key configuration."
        );
      }

      const prompt = `
You are a skilled content strategist. Your task is to turn raw Reddit content into a single, standalone, high-engagement LinkedIn post that feels human, story-driven, and non-templated. The post must strictly follow these rules:

1. **Word Count**:
- The post must be a minimum of 230 words. Posts under 230 words must be regenerated until they exceed the limit.

2. **Hooks**:
- Start with a hook that grabs attention. Vary using personal story, failure, success, question, bold statement, statistic, metaphor, scenario, challenge, etc.
- Never reveal the full insight in the first 1–2 lines.

3. **Structure**:
- Components can include hook, story/insight, bullets, reflection, lesson, or CTA—but order should differ.
- Line breaks must vary (sometimes 2–3 lines, sometimes 3–4 lines).

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

Reddit Content:
${content}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a professional LinkedIn content strategist who writes high-engagement, story-driven posts.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw new Error("Failed to generate LinkedIn post");
    }
  }

  /**
   * Process image to extract text and generate LinkedIn post
   * @param {string} imagePath - Path to the image file
   * @returns {Promise<Object>} - Object containing extracted text and LinkedIn post
   */
  async processImageToLinkedIn(imagePath) {
    try {
      console.log("Processing image:", imagePath);

      const extractedText = await this.extractTextFromImage(imagePath);
      console.log("Extracted text:", extractedText);

      const linkedInPost = await this.generateLinkedInPost(extractedText);

      return {
        extractedText,
        linkedInPost,
      };
    } catch (error) {
      console.error("Error processing image to LinkedIn:", error);
      throw error;
    }
  }

  /**
   * Clean up uploaded file
   * @param {string} filePath - Path to the file to delete
   */
  cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("Cleaned up file:", filePath);
      }
    } catch (error) {
      console.error("Error cleaning up file:", error);
    }
  }
}

module.exports = new RedditPostService();
