const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    role: {
      type: String,
      enum: ["write_only", "review", "admin"],
      required: true,
    },
    permissions: {
      canCreate: { type: Boolean, default: false },
      canEdit: { type: Boolean, default: false },
      canSchedule: { type: Boolean, default: false },
      canPublish: { type: Boolean, default: false },
      canReview: { type: Boolean, default: false },
      canDelete: { type: Boolean, default: false },
      canManagePermissions: { type: Boolean, default: false },
    },
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique user-profile combination
permissionSchema.index({ userId: 1, profileId: 1 }, { unique: true });

// Set default permissions based on role
permissionSchema.pre("save", function (next) {
  if (this.isModified("role")) {
    switch (this.role) {
      case "write_only":
        this.permissions = {
          canCreate: true,
          canEdit: true,
          canSchedule: true,
          canPublish: false,
          canReview: false,
          canDelete: true,
          canManagePermissions: false,
        };
        break;
      case "review":
        this.permissions = {
          canCreate: true,
          canEdit: true,
          canSchedule: true,
          canPublish: true,
          canReview: true,
          canDelete: true,
          canManagePermissions: false,
        };
        break;
      case "admin":
        this.permissions = {
          canCreate: true,
          canEdit: true,
          canSchedule: true,
          canPublish: true,
          canReview: true,
          canDelete: true,
          canManagePermissions: true,
        };
        break;
    }
  }
  next();
});

module.exports = mongoose.model("Permission", permissionSchema);
