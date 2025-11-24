const express = require("express");
const axios = require("axios");
const User = require("../../models/notion/Notion_user");
const NotionService = require("../../services/notion/notionService");

const router = express.Router();

// Lightweight test endpoint for frontend/backend connectivity checks
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Notion route is reachable" });
});

/**
 * GET /notion/auth
 * Redirect user to Notion OAuth authorization page
 */
router.get("/auth", (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).send("Missing userId");
  }

  const clientId = process.env.NOTION_CLIENT_ID;
  const redirectUri = process.env.NOTION_REDIRECT_URI;
  const state = encodeURIComponent(userId);

  const notionAuthUrl = `https://api.notion.com/v1/oauth/authorize?owner=user&client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&state=${state}`;

  return res.redirect(notionAuthUrl);
});

/**
 * POST /notion/auth/callback
 * Handle OAuth callback and save access token
 */
router.post("/auth/callback", async (req, res) => {
  try {
    const { code, userId } = req.body;

    if (!code) return res.status(400).json({ error: "Authorization code is required" });
    if (!userId || userId.trim() === "") return res.status(400).json({ error: "Valid userId required" });

    if (!process.env.NOTION_CLIENT_ID || !process.env.NOTION_CLIENT_SECRET) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    const basicAuth = Buffer.from(`${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`).toString("base64");

    const tokenResponse = await axios.post(
      "https://api.notion.com/v1/oauth/token",
      {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.NOTION_REDIRECT_URI,
      },
      {
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { access_token, bot_id, workspace_id } = tokenResponse.data;

    const user = await User.findOneAndUpdate(
      { _id: userId },
      {
        _id: userId,
        email: `${userId}@demo.klype.com`,
        notionAccessToken: access_token,
        notionBotId: bot_id,
        notionWorkspaceId: workspace_id,
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ success: true, message: "Notion connected successfully", userId: user._id });
  } catch (error) {
    console.error("Notion OAuth error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to connect Notion",
      details: error.response?.data?.error || error.message,
    });
  }
});

/**
 * GET /notion/users
 * Get users with Notion connections (for debugging/admin)
 */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ notionAccessToken: { $exists: true, $ne: null } })
      .select("_id email notionWorkspaceId")
      .limit(10);

    res.json({
      users: users.map(u => ({
        id: u._id,
        email: u.email,
        workspaceId: u.notionWorkspaceId,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /notion/databases/:userId
 */
router.get("/databases/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).catch(() => null);
    if (!user || !user.notionAccessToken) {
      const notionService = new NotionService("dev_dummy_token");
      const databases = await notionService.getDatabases();
      return res.json({ databases });
    }

    const notionService = new NotionService(user.notionAccessToken);
    const databases = await notionService.getDatabases();

    res.json({ databases });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /notion/pages/:userId
 */
router.get("/pages/:userId", async (req, res) => {
  try {
    // In dev, allow pages to be returned even if user isn't connected
    const user = await User.findById(req.params.userId).catch(() => null);
    if (!user || !user.notionAccessToken) {
      // Return dummy pages to avoid 400 during initial setup
      const notionService = new NotionService("dev_dummy_token");
      const pages = await notionService.getAllPages();
      return res.json({ pages });
    }

    const notionService = new NotionService(user.notionAccessToken);
    const pages = await notionService.getAllPages();

    res.json({ pages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /notion/subpages/:userId/:pageId
 */
router.get("/subpages/:userId/:pageId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).catch(() => null);
    if (!user || !user.notionAccessToken) {
      const notionService = new NotionService("dev_dummy_token");
      const subpages = await notionService.getSubpages(req.params.pageId);
      return res.json({ subpages });
    }

    const notionService = new NotionService(user.notionAccessToken);
    const subpages = await notionService.getSubpages(req.params.pageId);

    res.json({ subpages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /notion/page-content/:userId/:pageId
 */
router.get("/page-content/:userId/:pageId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).catch(() => null);
    if (!user || !user.notionAccessToken) {
      const notionService = new NotionService("dev_dummy_token");
      const content = await notionService.getPageContent(req.params.pageId);
      return res.json({ content });
    }

    const notionService = new NotionService(user.notionAccessToken);
    const content = await notionService.getPageContent(req.params.pageId);

    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
