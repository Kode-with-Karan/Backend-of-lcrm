
const { getTranscript } = require("youtube-transcript");
async function getYoutubeTranscript(videoId) {
  try {
    const transcript = await getTranscript(videoId);
    return transcript.map(t => t.text).join(" ");
  } catch (err) {
    return null;
  }
}
module.exports = { getYoutubeTranscript };
