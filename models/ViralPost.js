
const mongoose = require("mongoose");
const ViralPostSchema = new mongoose.Schema({ 
  text: { type: String, required: true },
  hashtags: [String],
  tone: { type: String },
  engagement: {
    likes: Number,
    shares: Number,
    comments: Number
  },
  postUrl: { type: String },
  scrapedAt: { type: Date, default: Date.now },
  keyword: { type: String, required: true }
});
module.exports = mongoose.model("ViralPost", ViralPostSchema);
