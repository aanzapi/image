const express = require('express');
const router = express.Router();
const imageController = require('../controllers/image.controller');

// Landing page
router.get('/', imageController.renderLandingPage);

// Serve image
router.get('/:filename', imageController.serveImage);

module.exports = router;