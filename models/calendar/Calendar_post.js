const mongoose = require("mongoose");

const PostSchema_Calendar = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    theme: {
      type: String,
      enum: [
        "Educational",
        "Personal Story",
        "Insight",
        "Question",
        "CTA",
        "Tips",
        "Industry News",
      ],
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
      index: true,
    },
    scheduledTime: {
      type: String,
      default: "10:00",
      validate: {
        validator: function (v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: "Time must be in HH:MM format",
      },
    },
    hashtags: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 30; // LinkedIn hashtag limit
        },
        message: "Cannot exceed 30 hashtags",
      },
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    generatedBy: {
      type: String,
      enum: ["AI", "User"],
      default: "AI",
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "published", "failed"],
      default: "draft",
      index: true,
    },
    linkedinPostId: {
      type: String,
      default: null,
    },
    engagement: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now },
    },
    notes: {
      type: String,
      default: "",
    },
    // New fields for enhanced functionality
    priority: {
      type: Number,
      default: 0,
      min: -5,
      max: 5,
    },
    contentLength: {
      type: Number,
      default: function () {
        return this.content ? this.content.length : 0;
      },
    },
    readabilityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    aiConfidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    performancePrediction: {
      expectedLikes: { type: Number, default: 0 },
      expectedComments: { type: Number, default: 0 },
      expectedShares: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    originalDate: {
      type: Date,
      default: function () {
        return this.scheduledDate;
      },
    },
    moveHistory: [
      {
        from: Date,
        to: Date,
        movedAt: { type: Date, default: Date.now },
        reason: String,
      },
    ],
    linkedPosts: [
      {
        postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post_Calendar" },
        relationship: {
          type: String,
          enum: ["series", "follow-up", "reference"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound indexes for better query performance
PostSchema_Calendar.index({ userId: 1, scheduledDate: 1 });
PostSchema_Calendar.index({ userId: 1, theme: 1 });
PostSchema_Calendar.index({ userId: 1, status: 1 });
PostSchema_Calendar.index({ userId: 1, scheduledDate: 1, status: 1 });
PostSchema_Calendar.index({ scheduledDate: 1, status: 1 }); // For scheduled job processing

// Virtual for formatted date
PostSchema_Calendar.virtual("formattedScheduledDate").get(function () {
  return this.scheduledDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Virtual for full date time
PostSchema_Calendar.virtual("fullScheduledDateTime").get(function () {
  const date = this.scheduledDate.toLocaleDateString();
  return `${date} at ${this.scheduledTime}`;
});

// Virtual for content preview
PostSchema_Calendar.virtual("contentPreview").get(function () {
  return this.content.length > 100
    ? this.content.substring(0, 100) + "..."
    : this.content;
});

// Virtual for engagement rate
PostSchema_Calendar.virtual("engagementRate").get(function () {
  if (!this.engagement.views || this.engagement.views === 0) return 0;
  const totalEngagement =
    this.engagement.likes + this.engagement.comments + this.engagement.shares;
  return (totalEngagement / this.engagement.views) * 100;
});

// Pre-save middleware to update content length
PostSchema_Calendar.pre("save", function (next) {
  if (this.isModified("content")) {
    this.contentLength = this.content.length;
  }
  next();
});

// Instance methods
PostSchema_Calendar.methods.moveToDate = function (newDate, reason = "") {
  if (this.scheduledDate) {
    this.moveHistory.push({
      from: this.scheduledDate,
      to: newDate,
      reason: reason,
    });
  }
  this.scheduledDate = newDate;
  return this.save();
};

PostSchema_Calendar.methods.updateEngagement = function (engagementData) {
  this.engagement = {
    ...this.engagement,
    ...engagementData,
    lastUpdated: new Date(),
  };
  return this.save();
};

PostSchema_Calendar.methods.calculateReadabilityScore = function () {
  // Simple readability calculation
  const sentences = this.content.split(/[.!?]+/).length - 1;
  const words = this.content.split(/\s+/).length;
  const avgWordsPerSentence = words / Math.max(sentences, 1);

  // Simplified Flesch Reading Ease approximation
  const score = Math.max(
    0,
    Math.min(100, 206.835 - 1.015 * avgWordsPerSentence)
  );
  this.readabilityScore = Math.round(score);
  return this.readabilityScore;
};

// Static methods
PostSchema_Calendar.statics.findByDateRange = function (
  userId,
  startDate,
  endDate
) {
  return this.find({
    userId,
    scheduledDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  }).sort({ scheduledDate: 1 });
};

PostSchema_Calendar.statics.findByTheme = function (userId, theme) {
  return this.find({ userId, theme }).sort({ scheduledDate: -1 });
};

PostSchema_Calendar.statics.getAnalytics = function (userId, period = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);

  return this.aggregate([
    {
      $match: {
        userId,
        scheduledDate: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$theme",
        count: { $sum: 1 },
        avgLikes: { $avg: "$engagement.likes" },
        avgComments: { $avg: "$engagement.comments" },
        avgShares: { $avg: "$engagement.shares" },
        totalViews: { $sum: "$engagement.views" },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
};

PostSchema_Calendar.statics.getTopPerformers = function (userId, limit = 10) {
  return this.find({
    userId,
    status: "published",
    "engagement.views": { $gt: 0 },
  })
    .sort({
      "engagement.likes": -1,
      "engagement.comments": -1,
      "engagement.shares": -1,
    })
    .limit(limit);
};

// Ensure virtuals are included in JSON output
PostSchema_Calendar.set("toJSON", { virtuals: true });
PostSchema_Calendar.set("toObject", { virtuals: true });

module.exports = mongoose.model("Post_Calendar", PostSchema_Calendar);
