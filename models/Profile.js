const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    original: {
      type: Object,
      default: {},
    },
    goal: {
      type: String,
      default: "",
    },
    rewritten: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", ProfileSchema);


