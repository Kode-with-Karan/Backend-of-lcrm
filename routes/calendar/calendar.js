const express = require("express");
const router = express.Router();
const Post = require("../../models/calendar/Calendar_post");
const UserPreferences = require("../../models/calendar/UserPreferences");

const contentGenerator = require("../../services/calendar/calendar_content_generator");

const defaultTopics = {
  Founder: [
    "startup lessons",
    "leadership challenges",
    "building company culture",
    "fundraising insights",
    "product development",
    "scaling teams",
    "market validation",
    "customer feedback",
    "business strategy",
    "work-life balance",
    "networking tips",
    "industry trends",
    "innovation mindset",
    "failure recovery",
    "success metrics",
  ],
  "SaaS Founder": [
    "SaaS metrics",
    "product-market fit",
    "customer acquisition",
    "churn reduction",
    "pricing strategy",
    "user onboarding",
    "feature prioritization",
    "technical debt",
    "API design",
    "security practices",
    "scalability challenges",
    "team building",
    "investor relations",
    "competitive analysis",
    "market trends",
  ],
  "Content Marketer": [
    "content strategy",
    "audience engagement",
    "brand storytelling",
    "social media trends",
    "content creation tools",
    "SEO tips",
    "campaign performance",
    "influencer marketing",
    "email marketing",
    "video content",
    "content distribution",
    "analytics insights",
    "creative process",
    "brand voice",
    "content planning",
  ],
  Freelancer: [
    "client acquisition",
    "pricing strategies",
    "project management",
    "work-life balance",
    "skill development",
    "networking tips",
    "portfolio building",
    "client communication",
    "time management",
    "financial planning",
    "market positioning",
    "service delivery",
    "business growth",
    "remote work",
    "professional development",
  ],
};

// POST /api/calendar/autoGenerate
router.post("/autoGenerate", async (req, res) => {
  try {
    console.log("AutoGenerate request received:", req.body);

    const {
      userId,
      customTopics = [],
      numberOfPosts = 15,
      startDate,
      userInputs = {},
    } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // Validate numberOfPosts
    if (numberOfPosts < 1 || numberOfPosts > 50) {
      return res.status(400).json({
        success: false,
        message: "numberOfPosts must be between 1 and 50",
      });
    }

    // Validate startDate if provided
    if (startDate && isNaN(new Date(startDate).getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate format",
      });
    }

    // Get user preferences
    let userPreferences = await UserPreferences.findOne({ userId });
    if (!userPreferences) {
      userPreferences = new UserPreferences({
        userId,
        role: userInputs.role || "Founder",
        industry: userInputs.industry || "",
        contentTone: userInputs.contentTone || "Professional",
        targetAudience: userInputs.targetAudience || "",
      });
      await userPreferences.save();
      console.log("Created new user preferences:", userPreferences);
    }

    // Determine topics to use
    let topics = customTopics.length > 0 ? customTopics : [];

    if (topics.length < numberOfPosts) {
      const userRole = userInputs.role || userPreferences.role || "Founder";
      const defaultTopicsForRole =
        defaultTopics[userRole] || defaultTopics["Founder"];
      const additionalTopics = defaultTopicsForRole.slice(
        0,
        numberOfPosts - topics.length
      );
      topics = [...topics, ...additionalTopics];
    }

    console.log("Topics to generate:", topics.slice(0, numberOfPosts));

    // Generate posts using AI
    const generatedPosts = await contentGenerator.generateMultiplePosts(
      topics.slice(0, numberOfPosts),
      {
        ...userPreferences.toObject(),
        ...userInputs,
      }
    );

    console.log(`Generated ${generatedPosts.length} posts`);

    // Create scheduled posts
    const scheduledPosts = [];
    const baseDate = startDate ? new Date(startDate) : new Date();
    baseDate.setDate(baseDate.getDate() + 1); // Start from tomorrow

    for (let i = 0; i < generatedPosts.length; i++) {
      const postDate = new Date(baseDate);
      postDate.setDate(baseDate.getDate() + i);

      // Skip weekends (optional)
      while (postDate.getDay() === 0 || postDate.getDay() === 6) {
        postDate.setDate(postDate.getDate() + 1);
      }

      const post = new Post({
        title: `${generatedPosts[i].theme} - ${generatedPosts[i].topic}`,
        content: generatedPosts[i].content,
        theme: generatedPosts[i].theme,
        hashtags: generatedPosts[i].hashtags,
        scheduledDate: postDate,
        scheduledTime: userPreferences.preferredPostingTimes?.[0] || "10:00",
        userId,
        generatedBy: "AI",
        status: "scheduled",
      });

      const savedPost = await post.save();
      scheduledPosts.push(savedPost);
    }

    console.log(`Saved ${scheduledPosts.length} posts to database`);

    res.json({
      success: true,
      message: `Generated ${scheduledPosts.length} posts successfully`,
      posts: scheduledPosts,
    });
  } catch (error) {
    console.error("Error in autoGenerate:", error);
    res.status(500).json({
      success: false,
      message: "Error generating calendar content",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// POST /api/calendar/posts - Create a new post
router.post("/posts", async (req, res) => {
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

    // Validate required fields
    if (!title || !content || !theme || !scheduledDate || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, content, theme, scheduledDate, userId",
      });
    }

    // Validate theme
    const validThemes = ["Educational", "Personal Story", "Insight", "Question", "CTA", "Tips", "Industry News"];
    if (!validThemes.includes(theme)) {
      return res.status(400).json({
        success: false,
        message: `Invalid theme. Must be one of: ${validThemes.join(", ")}`,
      });
    }

    // Validate scheduledDate
    const scheduledDateTime = new Date(scheduledDate);
    if (isNaN(scheduledDateTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheduledDate format",
      });
    }

    // Validate scheduledTime format (HH:MM)
    if (scheduledTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(scheduledTime)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheduledTime format. Use HH:MM format",
      });
    }

    // Validate hashtags array
    if (hashtags && (!Array.isArray(hashtags) || hashtags.length > 30)) {
      return res.status(400).json({
        success: false,
        message: "Hashtags must be an array with maximum 30 items",
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
    
    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: savedPost,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      success: false,
      message: "Error creating post",
      error: error.message,
    });
  }
});

// GET /api/calendar/posts
router.get("/posts", async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: "userId is required" 
      });
    }

    const query = { userId };
    if (startDate && endDate) {
      query.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const posts = await Post.find(query).sort({ scheduledDate: 1 });
    
    res.json({
      success: true,
      posts: posts,
      count: posts.length,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// PUT /api/calendar/posts/:id
router.put("/posts/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required for authorization",
      });
    }

    const updatedPost = await Post.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ 
        success: false,
        message: "Post not found or unauthorized" 
      });
    }

    res.json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// DELETE /api/calendar/posts/:id
router.delete("/posts/:id", async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required for authorization",
      });
    }

    const deletedPost = await Post.findOneAndDelete({ 
      _id: req.params.id, 
      userId 
    });

    if (!deletedPost) {
      return res.status(404).json({ 
        success: false,
        message: "Post not found or unauthorized" 
      });
    }

    res.json({ 
      success: true,
      message: "Post deleted successfully",
      deletedPost 
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// POST /api/calendar/bulk-update
router.post("/bulk-update", async (req, res) => {
  try {
    const { postIds, updates, userId } = req.body;

    if (!postIds || !Array.isArray(postIds) || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: postIds, userId",
      });
    }

    const result = await Post.updateMany(
      { _id: { $in: postIds }, userId },
      { $set: updates }
    );

    res.json({ 
      success: true, 
      message: "Posts updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error in bulk update:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// POST /api/calendar/duplicate-week
router.post("/duplicate-week", async (req, res) => {
  try {
    const { userId, sourceWeekStart } = req.body;

    if (!userId || !sourceWeekStart) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, sourceWeekStart",
      });
    }

    const sourceStart = new Date(sourceWeekStart);
    const sourceEnd = new Date(sourceStart);
    sourceEnd.setDate(sourceEnd.getDate() + 6);

    const sourcePosts = await Post.find({
      userId,
      scheduledDate: { $gte: sourceStart, $lte: sourceEnd },
    });

    if (sourcePosts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No posts found for the specified week",
      });
    }

    const duplicatedPosts = sourcePosts.map((post) => ({
      ...post.toObject(),
      _id: undefined,
      scheduledDate: new Date(
        post.scheduledDate.getTime() + 7 * 24 * 60 * 60 * 1000
      ),
      createdAt: undefined,
      updatedAt: undefined,
    }));

    const savedPosts = await Post.insertMany(duplicatedPosts);
    res.json({ 
      success: true, 
      message: `Duplicated ${savedPosts.length} posts successfully`,
      posts: savedPosts 
    });
  } catch (error) {
    console.error("Error duplicating week:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// POST /api/calendar/drag-drop
router.post("/drag-drop", async (req, res) => {
  try {
    const { postId, newDate, newTime, userId } = req.body;

    if (!postId || !newDate || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: postId, newDate, userId",
      });
    }

    // Validate the post belongs to the user
    const post = await Post.findOne({ _id: postId, userId });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or unauthorized",
      });
    }

    // Update the post with new date and time
    const updates = {
      scheduledDate: new Date(newDate),
      ...(newTime && { scheduledTime: newTime }),
    };

    const updatedPost = await Post.findByIdAndUpdate(postId, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: "Post moved successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error in drag-drop:", error);
    res.status(500).json({
      success: false,
      message: "Error moving post",
      error: error.message,
    });
  }
});

// POST /api/calendar/bulk-operations
router.post("/bulk-operations", async (req, res) => {
  try {
    const { operation, postIds, data, userId } = req.body;

    if (!operation || !postIds || !Array.isArray(postIds) || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: operation, postIds, userId",
      });
    }

    let result;

    switch (operation) {
      case "delete":
        result = await Post.deleteMany({
          _id: { $in: postIds },
          userId,
        });
        break;

      case "update_status":
        if (!data.status) {
          return res.status(400).json({
            success: false,
            message: "Status is required for update_status operation",
          });
        }
        result = await Post.updateMany(
          { _id: { $in: postIds }, userId },
          { $set: { status: data.status } }
        );
        break;

      case "reschedule":
        if (!data.startDate) {
          return res.status(400).json({
            success: false,
            message: "Start date is required for reschedule operation",
          });
        }

        const posts = await Post.find({
          _id: { $in: postIds },
          userId,
        }).sort({ scheduledDate: 1 });

        const baseDate = new Date(data.startDate);
        const updates = [];

        for (let i = 0; i < posts.length; i++) {
          const newDate = new Date(baseDate);
          newDate.setDate(baseDate.getDate() + i);

          // Skip weekends if specified
          if (data.skipWeekends) {
            while (newDate.getDay() === 0 || newDate.getDay() === 6) {
              newDate.setDate(newDate.getDate() + 1);
            }
          }

          updates.push({
            updateOne: {
              filter: { _id: posts[i]._id },
              update: {
                scheduledDate: newDate,
                ...(data.time && { scheduledTime: data.time }),
              },
            },
          });
        }

        result = await Post.bulkWrite(updates);
        break;

      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid operation" });
    }

    res.json({
      success: true,
      message: `Bulk ${operation} completed successfully`,
      result,
    });
  } catch (error) {
    console.error("Error in bulk operations:", error);
    res.status(500).json({
      success: false,
      message: "Error performing bulk operation",
      error: error.message,
    });
  }
});

// GET /api/calendar/analytics
router.get("/analytics", async (req, res) => {
  try {
    const { userId, period = "month" } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const now = new Date();
    let startDate;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "quarter":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const pipeline = [
      {
        $match: {
          userId,
          scheduledDate: { $gte: startDate, $lte: now },
        },
      },
      {
        $group: {
          _id: {
            theme: "$theme",
            status: "$status",
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$scheduledDate",
              },
            },
          },
          count: { $sum: 1 },
          totalLikes: { $sum: "$engagement.likes" },
          totalComments: { $sum: "$engagement.comments" },
          totalShares: { $sum: "$engagement.shares" },
          totalViews: { $sum: "$engagement.views" },
        },
      },
      {
        $group: {
          _id: null,
          themes: {
            $push: {
              theme: "$_id.theme",
              count: "$count",
              engagement: {
                likes: "$totalLikes",
                comments: "$totalComments",
                shares: "$totalShares",
                views: "$totalViews",
              },
            },
          },
          statusBreakdown: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
          dailyActivity: {
            $push: {
              date: "$_id.date",
              count: "$count",
            },
          },
        },
      },
    ];

    const analytics = await Post.aggregate(pipeline);

    res.json({
      success: true,
      data: analytics[0] || {
        themes: [],
        statusBreakdown: [],
        dailyActivity: [],
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics",
      error: error.message,
    });
  }
});

// POST /api/calendar/smart-schedule
router.post("/smart-schedule", async (req, res) => {
  try {
    const { userId, posts, preferences } = req.body;

    if (!userId || !posts || !Array.isArray(posts)) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, posts",
      });
    }

    // Get user preferences for scheduling
    let userPrefs = await UserPreferences.findOne({ userId });
    if (!userPrefs && preferences) {
      userPrefs = preferences;
    }

    const activeWeekdays = [];
    if (userPrefs?.weeklySchedule) {
      Object.entries(userPrefs.weeklySchedule).forEach(([day, active]) => {
        if (active) {
          const dayIndex = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6,
          }[day];
          if (dayIndex !== undefined) activeWeekdays.push(dayIndex);
        }
      });
    }

    const preferredTimes = userPrefs?.preferredPostingTimes || ["10:00"];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Start tomorrow

    const scheduledPosts = [];
    let currentDate = new Date(startDate);
    let timeIndex = 0;

    for (let i = 0; i < posts.length; i++) {
      // Find next valid posting day
      while (
        activeWeekdays.length > 0 &&
        !activeWeekdays.includes(currentDate.getDay())
      ) {
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const post = new Post({
        ...posts[i],
        userId,
        scheduledDate: new Date(currentDate),
        scheduledTime: preferredTimes[timeIndex % preferredTimes.length],
        status: "scheduled",
      });

      const savedPost = await post.save();
      scheduledPosts.push(savedPost);

      // Move to next time slot or next day
      timeIndex++;
      if (timeIndex >= preferredTimes.length) {
        timeIndex = 0;
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    res.json({
      success: true,
      message: `Smart scheduled ${scheduledPosts.length} posts`,
      posts: scheduledPosts,
    });
  } catch (error) {
    console.error("Error in smart schedule:", error);
    res.status(500).json({
      success: false,
      message: "Error performing smart schedule",
      error: error.message,
    });
  }
});

// GET /api/calendar/calendar-view - Get calendar data for frontend display
router.get("/calendar-view", async (req, res) => {
  try {
    const { userId, month, year } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // Default to current month/year if not provided
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    // Calculate start and end of the month
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    // Get posts for the month
    const posts = await Post.find({
      userId,
      scheduledDate: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ scheduledDate: 1 });

    // Format posts for calendar display
    const calendarEvents = posts.map(post => ({
      id: post._id,
      title: post.title,
      content: post.content,
      theme: post.theme,
      scheduledDate: post.scheduledDate,
      scheduledTime: post.scheduledTime,
      status: post.status,
      hashtags: post.hashtags,
      generatedBy: post.generatedBy,
      engagement: post.engagement,
      isPublished: post.isPublished,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    // Get user preferences for additional context
    const userPreferences = await UserPreferences.findOne({ userId });

    res.json({
      success: true,
      data: {
        events: calendarEvents,
        month: targetMonth,
        year: targetYear,
        userPreferences: userPreferences || null,
        totalEvents: calendarEvents.length,
        eventsByStatus: {
          draft: calendarEvents.filter(e => e.status === 'draft').length,
          scheduled: calendarEvents.filter(e => e.status === 'scheduled').length,
          published: calendarEvents.filter(e => e.status === 'published').length,
          failed: calendarEvents.filter(e => e.status === 'failed').length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching calendar view:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching calendar data",
      error: error.message,
    });
  }
});

// GET /api/calendar/events - Alternative endpoint for calendar events
router.get("/events", async (req, res) => {
  try {
    const { userId, start, end } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const query = { userId };
    
    // Add date range filter if provided
    if (start && end) {
      query.scheduledDate = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
    }

    const events = await Post.find(query)
      .select('title content theme scheduledDate scheduledTime status hashtags generatedBy engagement isPublished')
      .sort({ scheduledDate: 1 });

    res.json({
      success: true,
      events: events,
      count: events.length,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message,
    });
  }
});

module.exports = router;
