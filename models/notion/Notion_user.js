const mongoose = require('mongoose');

const NotionUserSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // userId from main User
  email: { type: String, required: true },
  notionAccessToken: { type: String },
  notionBotId: { type: String },
  notionWorkspaceId: { type: String },
}, {
  timestamps: true
});

module.exports = mongoose.model('Notion_user', NotionUserSchema);
