const express = require('express');
const router = express.Router();
const { analyzeProfile } = require('../controllers/profileController');

router.post('/analyze', analyzeProfile);

module.exports = router;