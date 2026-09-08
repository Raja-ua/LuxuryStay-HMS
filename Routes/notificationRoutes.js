const express = require('express');
const router = express.Router();
const notificationController = require('../Controllers/notificationController');

router.post('/', notificationController.createNotification);
router.get('/role/:role', notificationController.getNotificationsForRole);
router.put('/:id/read', notificationController.markAsRead);
router.put('/role/:role/read-all', notificationController.markAllAsRead);

module.exports = router;
