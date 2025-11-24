const mongoose = require("mongoose");

const UserPreferencesSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    industry: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      enum: [
        "Founder",
        "SaaS Founder",
        "Content Marketer",
        "Freelancer",
        "Agency Owner",
        "Product Manager",
        "Marketing Manager",
        "Sales Manager",
        "Consultant",
        "Coach",
      ],
      default: "Founder",
    },
    targetAudience: {
      type: String,
      default: "",
      trim: true,
    },
    businessGoals: {
      type: [String],
      default: [],
      enum: [
        "brand_awareness",
        "thought_leadership",
        "lead_generation",
        "networking",
        "customer_education",
        "product_awareness",
        "client_acquisition",
        "content_engagement",
        "brand_building",
        "showcase_expertise",
        "community_building",
        "personal_branding",
      ],
    },
    contentTone: {
      type: String,
      enum: [
        "Professional",
        "Casual",
        "Inspirational",
        "Educational",
        "Humorous",
        "Authoritative",
        "Conversational",
        "Motivational",
      ],
      default: "Professional",
    },
    preferredPostingTimes: {
      type: [String],
      default: ["10:00"],
      validate: {
        validator: function (times) {
          return times.every((time) =>
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)
          );
        },
        message: "All times must be in HH:MM format",
      },
    },
    customPrompts: {
      type: [String],
      default: [],
      validate: {
        validator: function (prompts) {
          return prompts.length <= 20; // Reasonable limit
        },
        message: "Cannot exceed 20 custom prompts",
      },
    },
    linkedinProfile: {
      username: { type: String, default: "" },
      accessToken: { type: String, default: "" },
      isConnected: { type: Boolean, default: false },
      profileUrl: { type: String, default: "" },
      lastSync: { type: Date, default: null },
    },
    contentPreferences: {
      includeEmojis: { type: Boolean, default: true },
      includeHashtags: { type: Boolean, default: true },
      maxHashtags: { type: Number, default: 5, min: 0, max: 30 },
      includeQuestions: { type: Boolean, default: true },
      includeCTA: { type: Boolean, default: true },
      preferredPostLength: {
        type: String,
        enum: ["short", "medium", "long"],
        default: "medium",
      },
      contentStyle: {
        type: String,
        enum: [
          "storytelling",
          "data-driven",
          "conversational",
          "instructional",
        ],
        default: "conversational",
      },
      visualPreferences: {
        includeImages: { type: Boolean, default: true },
        includeVideos: { type: Boolean, default: false },
        includePolls: { type: Boolean, default: false },
        includeCarousels: { type: Boolean, default: false },
      },
    },
    weeklySchedule: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: false },
      sunday: { type: Boolean, default: false },
    },
    timezone: {
      type: String,
      default: "UTC",
      validate: {
        validator: function (tz) {
          // Basic timezone validation
          return /^[A-Z][a-z]+\/[A-Z][a-z_]+$/.test(tz) || tz === "UTC";
        },
        message: "Invalid timezone format",
      },
    },
    // Enhanced scheduling preferences
    schedulingPreferences: {
      autoSchedule: { type: Boolean, default: false },
      bufferBetweenPosts: { type: Number, default: 1 }, // days
      avoidWeekends: { type: Boolean, default: true },
      respectTimeZone: { type: Boolean, default: true },
      maxPostsPerDay: { type: Number, default: 2, min: 1, max: 10 },
      prioritizeEngagementTimes: { type: Boolean, default: true },
    },
    // Content generation settings
    generationSettings: {
      creativityLevel: { type: Number, default: 0.7, min: 0, max: 1 },
      usePersonalExperiences: { type: Boolean, default: true },
      includeTrendingTopics: { type: Boolean, default: false },
      adaptToAudience: { type: Boolean, default: true },
      contentTemplates: [
        {
          name: String,
          template: String,
          theme: String,
        },
      ],
    },
    // Analytics preferences
    analyticsSettings: {
      trackEngagement: { type: Boolean, default: true },
      generateReports: { type: Boolean, default: true },
      reportFrequency: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        default: "weekly",
      },
      emailReports: { type: Boolean, default: false },
      performanceGoals: {
        likesPerPost: { type: Number, default: 0 },
        commentsPerPost: { type: Number, default: 0 },
        sharesPerPost: { type: Number, default: 0 },
        engagementRate: { type: Number, default: 0 },
      },
    },
    // Notification settings
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
      beforePosting: { type: Number, default: 30 }, // minutes
      weeklyDigest: { type: Boolean, default: true },
      performanceAlerts: { type: Boolean, default: true },
    },
    // API integrations
    integrations: {
      zapier: {
        enabled: { type: Boolean, default: false },
        webhookUrl: { type: String, default: "" },
      },
      slack: {
        enabled: { type: Boolean, default: false },
        webhookUrl: { type: String, default: "" },
        channel: { type: String, default: "" },
      },
      googleAnalytics: {
        enabled: { type: Boolean, default: false },
        trackingId: { type: String, default: "" },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
UserPreferencesSchema.index({ userId: 1 });
UserPreferencesSchema.index({ role: 1 });
UserPreferencesSchema.index({ industry: 1 });
UserPreferencesSchema.index({ updatedAt: -1 });

// Virtual for active posting days
UserPreferencesSchema.virtual("activePostingDays").get(function () {
  const days = [];
  Object.entries(this.weeklySchedule).forEach(([day, active]) => {
    if (active) days.push(day);
  });
  return days;
});

// Virtual for total daily posting slots
UserPreferencesSchema.virtual("dailyPostingSlots").get(function () {
  return (
    this.preferredPostingTimes.length *
    this.schedulingPreferences.maxPostsPerDay
  );
});

// Instance methods
UserPreferencesSchema.methods.getOptimalPostingTimes = function () {
  // Return posting times sorted by potential engagement
  const times = [...this.preferredPostingTimes];

  // Sort based on general best practices (can be enhanced with ML)
  return times.sort((a, b) => {
    const aHour = parseInt(a.split(":")[0]);
    const bHour = parseInt(b.split(":")[0]);

    // Prefer business hours (9-17) and early morning (7-9)
    const aScore =
      aHour >= 9 && aHour <= 17 ? 3 : aHour >= 7 && aHour <= 9 ? 2 : 1;
    const bScore =
      bHour >= 9 && bHour <= 17 ? 3 : bHour >= 7 && bHour <= 9 ? 2 : 1;

    return bScore - aScore;
  });
};

UserPreferencesSchema.methods.shouldPostOnDay = function (date) {
  const dayName = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ][date.getDay()];
  return this.weeklySchedule[dayName];
};

UserPreferencesSchema.methods.getNextValidPostingDate = function (
  fromDate = new Date()
) {
  const date = new Date(fromDate);

  // Find the next valid posting day
  while (!this.shouldPostOnDay(date)) {
    date.setDate(date.getDate() + 1);
  }

  return date;
};

UserPreferencesSchema.methods.generateContentPrompt = function (topic, theme) {
  const basePrompt = `Create a ${this.contentTone.toLowerCase()} LinkedIn post about ${topic}`;
  const audiencePrompt = this.targetAudience
    ? ` for ${this.targetAudience}`
    : "";
  const stylePrompt = this.contentPreferences.contentStyle
    ? ` in a ${this.contentPreferences.contentStyle} style`
    : "";

  let requirements = [];

  if (this.contentPreferences.includeEmojis)
    requirements.push("include relevant emojis");
  if (this.contentPreferences.includeHashtags)
    requirements.push(
      `include up to ${this.contentPreferences.maxHashtags} hashtags`
    );
  if (this.contentPreferences.includeQuestions)
    requirements.push("end with an engaging question");
  if (this.contentPreferences.includeCTA)
    requirements.push("include a clear call-to-action");

  const lengthGuide = {
    short: "Keep it under 500 characters",
    medium: "Aim for 500-1000 characters",
    long: "Write 1000+ characters for detailed engagement",
  };

  requirements.push(lengthGuide[this.contentPreferences.preferredPostLength]);

  const customPrompts =
    this.customPrompts.length > 0
      ? `\n\nAdditional guidelines: ${this.customPrompts.join(". ")}`
      : "";

  return `${basePrompt}${audiencePrompt}${stylePrompt}.
  
Requirements:
- ${requirements.join("\n- ")}
- Make it engaging and valuable for ${this.role} professionals
- Focus on ${this.businessGoals.join(", ")} goals
${customPrompts}`;
};

// Static methods
UserPreferencesSchema.statics.getDefaultPreferences = function (
  userId,
  role = "Founder"
) {
  return new this({
    userId,
    role,
    // Set intelligent defaults based on role
    contentTone: role.includes("Marketing") ? "Conversational" : "Professional",
    businessGoals:
      role === "Founder"
        ? ["thought_leadership", "networking"]
        : role.includes("Marketing")
        ? ["brand_awareness", "content_engagement"]
        : ["personal_branding", "showcase_expertise"],
  });
};

UserPreferencesSchema.statics.bulkUpdateSchedules = function (
  userIds,
  scheduleUpdate
) {
  return this.updateMany(
    { userId: { $in: userIds } },
    { $set: { weeklySchedule: scheduleUpdate } }
  );
};

// Pre-save middleware
UserPreferencesSchema.pre("save", function (next) {
  // Ensure at least one posting time is set
  if (this.preferredPostingTimes.length === 0) {
    this.preferredPostingTimes = ["10:00"];
  }

  // Ensure at least one business goal is set
  if (this.businessGoals.length === 0) {
    this.businessGoals = ["personal_branding"];
  }

  next();
});

// Include virtuals in JSON output
UserPreferencesSchema.set("toJSON", { virtuals: true });
UserPreferencesSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("UserPreferences", UserPreferencesSchema);
