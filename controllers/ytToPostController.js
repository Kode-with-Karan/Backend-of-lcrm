const { extractVideoId } = require("../utils/youtubeHelper");
const { getYoutubeTranscript } = require("../services/transcriptService");
const { downloadAndTranscribe } = require("../services/whisperService");
const { generateLinkedInPost } = require("../services/Post_yt_generator");

async function ytToPost(req, res) {

  console.log("ytToPost called");

  try {
    const { youtubeUrl, tone } = req.body;

    console.log("youtubeUrl", youtubeUrl);
    console.log("tone", tone);

    if (!youtubeUrl) {
      return res.status(400).json({ error: "YouTube URL is required" });
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    // Reject placeholder values early
    if (youtubeUrl.includes('VIDEO_ID') || youtubeUrl.includes('{VIDEO_ID}')) {
      return res.status(400).json({ error: 'You must replace VIDEO_ID with a real YouTube id in the url' });
    }

    let transcript;

    try {
      transcript = await getYoutubeTranscript(videoId);
    } catch (err) {
      console.warn("⚠️ YouTube transcript failed, falling back to Whisper:", err.message);
    }

    if (!transcript) {
      try {
        transcript = await downloadAndTranscribe(youtubeUrl);
      } catch (err) {
        console.error("❌ Whisper transcription failed:", err.message || err);
      }
    }

    if (!transcript) {
      return res.status(500).json({ error: "Transcript not found" });
    }

    let result;
    try {
      result = await generateLinkedInPost(transcript, tone);
    } catch (err) {
      console.error("❌ OpenAI post generation failed:", err);
      if (err.message.includes("Incorrect API key") || err.code === "invalid_api_key") {
        return res.status(401).json({ error: "OpenAI API key is invalid or missing" });
      }
      return res.status(500).json({ error: "Failed to generate LinkedIn post", details: err.message });
    }

    res.status(200).json(result);

  } catch (err) {
    console.error("❌ ytToPost unknown error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}

module.exports = { ytToPost };
