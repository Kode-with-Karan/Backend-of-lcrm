class AIService {
  async convertToLinkedInPost(content, tone, goal) {
    // Dummy implementation
    const post = `LinkedIn Post [${tone}|${goal}]:\n${content}\n#ai #notion`;
    return { post, wordCount: post.split(' ').length };
  }
}
module.exports = AIService;
