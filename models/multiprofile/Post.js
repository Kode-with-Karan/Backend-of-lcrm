const mongoose = require("mongoose");

const postSchema_multiprofile = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Changed to false for demo purposes
      default: null,
    },
    content: {
      type: String,
      required: true,
      maxlength: 3000,
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: [
        "draft",
        "pending_approval",
        "approved",
        "scheduled",
        "published",
        "rejected",
        "failed",
      ],
      default: "draft",
    },
    postType: {
      type: String,
      enum: ["text", "image", "video", "article", "poll", "document"],
      default: "text",
    },
    hashtags: [
      {
        type: String,
        trim: true,
      },
    ],
    mentions: [String],
    mediaUrls: [
      {
        url: String,
        type: {
          type: String,
          enum: ["image", "video", "document"],
        },
        filename: String,
      },
    ],
    linkedinPostId: {
      type: String,
      default: null,
    },
    analytics: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now },
    },
    approval: {
      submittedAt: Date,
      reviewedAt: Date,
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reviewNote: String,
      history: [
        {
          action: {
            type: String,
            enum: ["submitted", "approved", "rejected", "resubmitted"],
          },
          by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          at: {
            type: Date,
            default: Date.now,
          },
          note: String,
        },
      ],
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    templateName: {
      type: String,
      default: null,
    },
    // LinkedIn Integration Fields
    linkedinUrl: {
      type: String,
      default: null,
    },
    isImportedFromLinkedIn: {
      type: Boolean,
      default: false,
    },
    originalLinkedinData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    authorName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
postSchema_multiprofile.index({ profileId: 1, status: 1 });
postSchema_multiprofile.index({ scheduledDate: 1, status: 1 });
postSchema_multiprofile.index({ authorId: 1 });

module.exports = mongoose.model("Post_multiprofile", postSchema_multiprofile);
