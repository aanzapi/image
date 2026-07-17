const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload.middleware');
const uploadController = require('../controllers/upload.controller');

router.post('/', upload.single('image'), uploadController.uploadImage);

module.exports = router;