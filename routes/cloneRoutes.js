const express = require('express');
const { clonePostFromManual } = require('../controllers/cloneController'); 
const router = express.Router();

router.post('/clone', clonePostFromManual); 
module.exports = router;
