const express = require('express');
const router = express.Router();
const analyticsController = require('../Controllers/analyticsController');

router.get('/', analyticsController.getDashboardAnalytics);

module.exports = router;
