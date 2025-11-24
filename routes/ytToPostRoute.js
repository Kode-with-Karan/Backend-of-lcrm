
const express = require("express");
const router = express.Router();
const { ytToPost } = require("../controllers/ytToPostController");
router.post("/", ytToPost);
module.exports = router;
