// Core server
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load env
dotenv.config();

// Create app
const app = express();

// Basic security and perf
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan("dev"));

// Body parsing
app.use(bodyParser.json({ limit: "2mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Database
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/calendar";
mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exitCode = 1;
  });

// Routes that exist in this project
const calendarRouter = require("./routes/calendar/calendar");
const calendarPostsRouter = require("./routes/calendar/calendar_posts");
const calendarPreferencesRouter = require("./routes/calendar/calendar_preferences");
const voiceRoutes = require("./routes/voiceNoteRoutes");
const profileRoute = require("./routes/profileRoute");
const cloneRoutes = require("./routes/cloneRoutes");
const goalPostRoutes = require("./routes/goalPost");
const ytToPostRoute = require('./routes/ytToPostRoute');
const viralPostRoutes = require('./routes/viralpostsearch');
const postGeneratorRoutes = require('./routes/postGeneratorRoutes');
const notionRoutes = require('./routes/notion/notion');
const generateFromNoteRoutes = require('./routes/notion/generateFromNote');

app.use("/api/calendar", calendarRouter);
app.use("/api/calendar/posts", calendarPostsRouter);
app.use("/api/calendar/preferences", calendarPreferencesRouter);
app.use("/api/voice", voiceRoutes);
app.use("/api/profile", profileRoute);
app.use("/api", cloneRoutes);
app.use("/api/goal", goalPostRoutes);
app.use('/api/yt-to-post', ytToPostRoute);
app.use('/api/viralpost', viralPostRoutes);
app.use('/api/post', postGeneratorRoutes);
app.use('/api/notion', notionRoutes);
app.use('/api/generateFromNote', generateFromNoteRoutes);
// Auto-load any new route files that declare a basePath
try {
  const path = require("path");
  const { autoLoadRoutes } = require("./utils/routeAutoloader");
  const routesRoot = path.join(__dirname, "routes");
  autoLoadRoutes(app, routesRoot);
} catch (e) {
  console.warn("Route autoloader unavailable:", e.message);
}

// Friendly JSON parse error handler (returns 400 instead of 500)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON body. On Windows PowerShell, wrap the JSON in single quotes.",
      hint: "Example: curl -X POST ... -H 'Content-Type: application/json' -d '{ " +
        "\"headline\": \"h\", \"about\": \"a\", \"experience\": \"e\" }'",
    });
  }
  next(err);
});


// Health endpoint for curl
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not Found" });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(500).json({
    success: false,
    error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong!" },
  });
});

// Initialize scheduler (safe import after models are registered via routes' requires)
try {
  require("./services/calendar/scheduler");
} catch (e) {
  console.warn("Scheduler failed to initialize:", e.message);
}

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});


