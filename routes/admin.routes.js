const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

router.get('/', adminController.renderDashboard);
router.delete('/image/:id', adminController.deleteImage);

module.exports = router;