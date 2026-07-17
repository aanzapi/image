const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/gallery.controller');

router.get('/', galleryController.renderGallery);
router.get('/:filename', galleryController.renderImageDetail);

module.exports = router;