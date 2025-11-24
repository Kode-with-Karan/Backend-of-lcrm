const { URL } = require("url");

function extractVideoId(youtubeUrl) {
  try {
    const parsed = new URL(youtubeUrl);
    if (parsed.hostname.includes("youtube.com")) {
  if (parsed.pathname.includes("/shorts")) return parsed.pathname.split("/").pop();
  if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
    } else if (parsed.hostname === "youtu.be") {
      return parsed.pathname.replace("/", "");
    }
  } catch (e) {
    return null;
  }
  return null;
}

module.exports = { extractVideoId };
