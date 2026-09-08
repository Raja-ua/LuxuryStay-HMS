const express = require('express');
const router = express.Router();
const serviceRequestController = require('../Controllers/serviceRequestController');

router.post('/', serviceRequestController.createRequest);
router.get('/', serviceRequestController.getAllRequests);
router.get('/user/:userId', serviceRequestController.getUserRequests);
router.put('/:id', serviceRequestController.updateRequestStatus);
router.delete('/:id', serviceRequestController.deleteRequest);

module.exports = router;
