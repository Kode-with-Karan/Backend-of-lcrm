const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Made optional for non-authenticated usage
    },
    linkedinId: {
      type: String,
      required: true,
      unique: true,
    },
    profileName: {
      type: String,
      required: true,
      trim: true,
    },
    profileUrl: {
      type: String,
      required: true,
    },
    profileData: {
      headline: String,
      summary: String,
      profilePicture: String,
      industry: String,
      location: String,
      connections: Number,
      experience: [
        {
          title: String,
          company: String,
          startDate: Date,
          endDate: Date,
          current: Boolean,
        },
      ],
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    tokenExpiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    permissions: {
      canPost: { type: Boolean, default: true },
      canSchedule: { type: Boolean, default: true },
      requiresApproval: { type: Boolean, default: false },
    },
    teamMembers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["write_only", "review", "admin"],
          default: "write_only",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    connectionStatus: {
      type: String,
      enum: ["connected", "disconnected", "error", "pending"],
      default: "connected",
    },
    profileType: {
      type: String,
      enum: ["personal", "company", "client"],
      default: "personal",
    },
    brandVoice: {
      tone: {
        type: String,
        enum: [
          "professional",
          "casual",
          "friendly",
          "authoritative",
          "creative",
        ],
        default: "professional",
      },
      keywords: [String],
      industries: [String],
      contentThemes: [String],
    },
    postingSchedule: {
      timezone: String,
      frequency: {
        type: String,
        enum: ["daily", "weekly", "custom"],
        default: "daily",
      },
      preferredTimes: [String],
      daysOfWeek: [Number], // 0-6 (Sunday-Saturday)
    },
    analytics: {
      totalPosts: { type: Number, default: 0 },
      totalEngagement: { type: Number, default: 0 },
      averageEngagement: { type: Number, default: 0 },
      lastAnalyticsUpdate: Date,
    },
    lastSyncAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
profileSchema.index({ userId: 1, isActive: 1 });
profileSchema.index({ linkedinId: 1 });

// Virtual properties to match frontend expectations
profileSchema.virtual("name").get(function () {
  return this.profileName;
});

profileSchema.virtual("linkedin_url").get(function () {
  return this.profileUrl;
});

profileSchema.virtual("avatar_url").get(function () {
  return this.profileData?.profilePicture;
});

profileSchema.virtual("headline").get(function () {
  return this.profileData?.headline;
});

profileSchema.virtual("location").get(function () {
  return this.profileData?.location;
});

profileSchema.virtual("connection_status").get(function () {
  return this.connectionStatus;
});

// Ensure virtual fields are serialized
profileSchema.set("toJSON", { virtuals: true });
profileSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Profile", profileSchema);
