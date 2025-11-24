const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "manager", "writer", "reviewer"],
      default: "writer",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    company: {
      type: String,
      trim: true,
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    profilePicture: {
      type: String,
      default: null,
    },
    linkedinProfiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
      },
    ],
    permissions: {
      canCreatePosts: { type: Boolean, default: true },
      canSchedulePosts: { type: Boolean, default: true },
      canPublishPosts: { type: Boolean, default: false },
      canManageProfiles: { type: Boolean, default: false },
      canViewAnalytics: { type: Boolean, default: true },
      canManageTeam: { type: Boolean, default: false },
    },
    preferences: {
      defaultPostTime: {
        type: String,
        default: "09:00",
      },
      autoApproveOwnPosts: {
        type: Boolean,
        default: true,
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model("User", userSchema);
