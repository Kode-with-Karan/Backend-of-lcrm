const rolePrompts = {
    "Founders": `
        Story: Write a LinkedIn post (250–300 words) in the voice of a founder sharing a story with a trusted peer, as if over coffee. Humble, direct, reflective. Start with a relatable hook and core story. Add 3–5 bullet points with lessons. End with a reflective question.
        Rules: Use contractions. Vary sentence length. Avoid jargon. No em dashes. No emojis. Must feel genuine. End with exactly 3 relevant hashtags.

        Insight: Share a counter-intuitive business insight. Start by challenging an assumption. Unpack reasoning, then 3–5 bullet takeaways. End with bold, forward-thinking statement.
        Rules: Use contractions. Direct sentences, no passive voice. Replace jargon with plain English. No em dashes. No emojis. 3 hashtags.

        CTA: Motivational, action-oriented voice. Start with a pain-point question. Build short narrative, then 3–5 bullets for benefits. Conclude with a clear CTA.
        Rules: Contractions. Punchy sentences. Active voice. No em dashes. No emojis. 3 hashtags.

        Tip: Share a practical tip. Introduce the problem, explain solution. Add 3–5 step bullets. End encouraging people to try it.
        Rules: Contractions. Instructional. Avoid jargon. No em dashes. No emojis. 3 hashtags.

        Lesson: Share a mistake. Admit it, explain what went wrong. Add 3–5 key takeaways. End with growth outlook.
        Rules: Contractions. Honest, simple tone. Vary sentences. No em dashes. No emojis. 3 hashtags.

        Update: Announce company update. State news clearly upfront. Add context. 3–5 bullet impacts. End crediting team.
        Rules: Contractions. Energetic and positive. Concise. No em dashes. No emojis. 3 hashtags.`,
    "SaaS/AI Founders": `
        Story: Share “story behind the feature.” Start with customer problem, narrate journey, 3–5 bullets for challenges. End with future outlook.

        Insight: Forward-looking tech insight. Challenge narrative, explain why, add 3–5 bullets predictions/advice. End thought-provoking.

        CTA: Hook with value proposition. 3–5 bullets for features. End with clear CTA.

        Tip: Share a practical tip on tech leadership or product management. Frame challenge, add 3–5 bullets. End inviting input.

        Lesson: Reflect on failure. Admit it, analyze cause. Add 3–5 bullets for process/architecture changes. End with iterative learning.

        Update: Announce major tech update. Clear intro, context, 3–5 metrics or features. End with what’s next.
        Rules for all: Contractions. Clear, simple, precise language. Avoid jargon and buzzwords. Vary structure. No em dashes. No emojis. Always end with 3`,
    "Ghostwriters": `
        Story: Share challenge of capturing a client’s voice. Add 3–5 bullets for lessons. End reflecting on brand power.

        Insight: Share what makes executive content effective. Challenge misconception. Add 3–5 bullets advice. End with ROI of authenticity.

        CTA: Address pain point of time-strapped executives. Position service as solution. Add 3–5 bullets for outcomes. End with CTA to connect.

        Tip: Share practical writing tip. Frame common struggle. Add 3–5 bullet steps. End encouraging to try it.

        Lesson: Reflect on writer–client relationships. Stress partnership. Add 3–5 takeaways. End with wisdom about great work.

        Update: Share professional update. Announce clearly. Add context. Use 3–5 bullets for achievements or focus. End with gratitude.
        Rules: Contractions. Vivid, clear language. No em dashes. No emojis. End with 3 specific hashtags.`,
    "Company Owners": `
        Story: Celebrate milestone. Announce, share short journey story. 3–5 bullets for growth lessons. End thanking team.

        Insight: Share leadership or culture insight. Start with principle. Short anecdote. 3–5 bullets advice. End with value of people.

        CTA: Outline industry vision. Position company. Add 3–5 bullets for ideal partner profile. End with clear CTA.

        Tip: Share practical operations/finance/team tip. Frame common challenge. 3–5 bullet guide. End inviting discussion.

        Lesson: Share challenge. Be transparent but constructive. 3–5 lessons. End with perseverance message.

        Update: Announce expansion/acquisition. State clearly upfront. Add rationale. 3–5 bullet highlights. End confidently about future.
        Rules: Contractions. Strong, confident tone. Honest but warm. No em dashes. No emojis. End with 3 specific hashtags.`,
    "Freelancers": `
        Story: Share a challenging project that became a success. Start with client problem. Explain process. Add 3–5 bullets with measurable results. End reflecting on partnership success.
        Rules: Contractions. Balance “we” and “I.” Focus on outcomes, not effort. No em dashes. No emojis. End with 3 hashtags.`,
}

module.exports = rolePrompts;