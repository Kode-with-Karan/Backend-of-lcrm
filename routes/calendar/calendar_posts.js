const express = require("express");
const router = express.Router();
const Post = require("../../models/calendar/Calendar_post");


router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const posts = await Post.find({ userId }).sort({ scheduledDate: 1 });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: error.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: error.message });
  }
});


router.post("/", async (req, res) => {
  try {
    const {
      title,
      content,
      theme,
      scheduledDate,
      scheduledTime,
      hashtags,
      userId,
      generatedBy = "User",
    } = req.body;
    
    if (!title || !content || !theme || !scheduledDate || !userId) {
      return res.status(400).json({
        message:
          "Missing required fields: title, content, theme, scheduledDate, userId",
      });
    }

    const newPost = new Post({
      title,
      content,
      theme,
      scheduledDate: new Date(scheduledDate),
      scheduledTime: scheduledTime || "10:00",
      hashtags: hashtags || [],
      userId,
      generatedBy,
      status: "draft",
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: error.message });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);

    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ message: "Post deleted successfully", deletedPost });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: error.message });
  }
});


router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["draft", "scheduled", "published"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(status === "published" && { isPublished: true }),
      },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(updatedPost);
  } catch (error) {
    console.error("Error updating post status:", error);
    res.status(500).json({ message: error.message });
  }
});


router.get("/stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await Post.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          draftPosts: {
            $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
          },
          scheduledPosts: {
            $sum: { $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0] },
          },
          publishedPosts: {
            $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] },
          },
          postsByTheme: {
            $push: "$theme",
          },
        },
      },
    ]);
    
    const themeStats = await Post.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$theme",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      overview: stats[0] || {
        totalPosts: 0,
        draftPosts: 0,
        scheduledPosts: 0,
        publishedPosts: 0,
      },
      themeBreakdown: themeStats,
    });
  } catch (error) {
    console.error("Error fetching post stats:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
