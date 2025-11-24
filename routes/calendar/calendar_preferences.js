const express = require("express");
const router = express.Router();
const UserPreferences = require("../../models/calendar/UserPreferences");


router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    let preferences = await UserPreferences.findOne({ userId });

    
    if (!preferences) {
      preferences = new UserPreferences({
        userId,
        industry: "",
        role: "Founder",
        targetAudience: "",
        businessGoals: [],
        contentTone: "Professional",
        preferredPostingTimes: ["10:00"],
        customPrompts: [],
      });
      await preferences.save();
    }

    res.json(preferences);
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ message: error.message });
  }
});


router.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Remove userId from update data to prevent conflicts
    delete updateData.userId;

    const preferences = await UserPreferences.findOneAndUpdate(
      { userId },
      updateData,
      {
        new: true,
        upsert: true, // Create if doesn't exist
        runValidators: true,
      }
    );

    res.json(preferences);
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ message: error.message });
  }
});


router.post("/", async (req, res) => {
  try {
    const {
      userId,
      industry,
      role,
      targetAudience,
      businessGoals,
      contentTone,
      preferredPostingTimes,
      customPrompts,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    
    const existingPreferences = await UserPreferences.findOne({ userId });
    if (existingPreferences) {
      return res.status(409).json({
        message: "Preferences already exist for this user",
        preferences: existingPreferences,
      });
    }

    const preferences = new UserPreferences({
      userId,
      industry: industry || "",
      role: role || "Founder",
      targetAudience: targetAudience || "",
      businessGoals: businessGoals || [],
      contentTone: contentTone || "Professional",
      preferredPostingTimes: preferredPostingTimes || ["10:00"],
      customPrompts: customPrompts || [],
    });

    const savedPreferences = await preferences.save();
    res.status(201).json(savedPreferences);
  } catch (error) {
    console.error("Error creating preferences:", error);
    res.status(500).json({ message: error.message });
  }
});


router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const deletedPreferences = await UserPreferences.findOneAndDelete({
      userId,
    });

    if (!deletedPreferences) {
      return res.status(404).json({ message: "Preferences not found" });
    }

    res.json({
      message: "Preferences deleted successfully",
      deletedPreferences,
    });
  } catch (error) {
    console.error("Error deleting preferences:", error);
    res.status(500).json({ message: error.message });
  }
});


router.put("/:userId/posting-times", async (req, res) => {
  try {
    const { userId } = req.params;
    const { preferredPostingTimes } = req.body;

    if (!Array.isArray(preferredPostingTimes)) {
      return res.status(400).json({
        message: "preferredPostingTimes must be an array",
      });
    }

    const preferences = await UserPreferences.findOneAndUpdate(
      { userId },
      { preferredPostingTimes },
      { new: true }
    );

    if (!preferences) {
      return res.status(404).json({ message: "Preferences not found" });
    }

    res.json(preferences);
  } catch (error) {
    console.error("Error updating posting times:", error);
    res.status(500).json({ message: error.message });
  }
});


router.put("/:userId/custom-prompts", async (req, res) => {
  try {
    const { userId } = req.params;
    const { customPrompts } = req.body;

    if (!Array.isArray(customPrompts)) {
      return res.status(400).json({
        message: "customPrompts must be an array",
      });
    }

    const preferences = await UserPreferences.findOneAndUpdate(
      { userId },
      { customPrompts },
      { new: true }
    );

    if (!preferences) {
      return res.status(404).json({ message: "Preferences not found" });
    }

    res.json(preferences);
  } catch (error) {
    console.error("Error updating custom prompts:", error);
    res.status(500).json({ message: error.message });
  }
});


router.get("/defaults/roles", (req, res) => {
  const roles = [
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
  ];

  res.json({ roles });
});


router.get("/defaults/tones", (req, res) => {
  const tones = [
    "Professional",
    "Casual",
    "Inspirational",
    "Educational",
    "Humorous",
    "Authoritative",
    "Conversational",
    "Motivational",
  ];

  res.json({ tones });
});


router.get("/defaults/industries", (req, res) => {
  const industries = [
    "Technology",
    "SaaS",
    "E-commerce",
    "Healthcare",
    "Finance",
    "Education",
    "Real Estate",
    "Marketing",
    "Consulting",
    "Manufacturing",
    "Retail",
    "Non-profit",
    "Entertainment",
    "Food & Beverage",
    "Travel & Hospitality",
  ];

  res.json({ industries });
});

module.exports = router;
