const { OpenAI } = require('openai');
require('dotenv').config();

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAI({ apiKey: process.env.FINETUNNED_API_KEY });
const MODEL = "ft:gpt-4.1-2025-04-14:klype:kurator:CEDWYhAe";

async function chatCompletion(messages, options ) {
  return openai.chat.completions.create({
    model: MODEL,
    messages,
    max_tokens: options?.max_tokens || 1200,
    temperature: options?.temperature ?? 0.7,
  });
}

module.exports = openai;
module.exports.chatCompletion = chatCompletion;
