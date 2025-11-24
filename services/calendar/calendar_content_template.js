// Redeploy trigger: no functional change

class ContentTemplates {
  constructor() {
    this.templates = {
      listicle: {
        structure:
          "Here are {number} {topic} tips that changed my perspective:\n\n{points}\n\nWhich resonates most with you?",
        example:
          "Here are 5 productivity tips that changed my perspective:\n\n→ Time-blocking over to-do lists\n→ Single-tasking beats multitasking\n→ Energy management > time management\n\nWhich resonates most with you?",
      },
      story: {
        structure:
          "A year ago, I {problem}.\n\nToday, I {solution}.\n\nHere's what I learned:\n\n{lesson}\n\n{question}",
        example:
          "A year ago, I was struggling with team productivity.\n\nToday, I've built a system that increased our output by 40%.\n\nHere's what I learned:\n\n• Clear expectations beat micromanagement\n• Regular check-ins prevent last-minute surprises\n• Celebrating small wins builds momentum\n\nWhat's your biggest team challenge?",
      },
      question: {
        structure:
          "Quick question for {audience}:\n\n{main_question}\n\nI'm curious because {reason}.\n\n{follow_up_question}",
        example:
          "Quick question for fellow founders:\n\nWhat's your biggest hiring mistake?\n\nI'm curious because I just made one myself and want to learn from others.\n\nDid you recover? What would you do differently?",
      },
    };
  }

  getTemplate(type) {
    return this.templates[type] || null;
  }

  getAllTemplates() {
    return this.templates;
  }
}

module.exports = new ContentTemplates();
