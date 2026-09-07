const express = require('express');
const router = express.Router();
const maintenanceController = require('../Controllers/maintenanceController');

router.post('/', maintenanceController.createMaintenanceRequest);
router.get('/', maintenanceController.getAllMaintenanceRequests);
router.get('/staff/:staffId', maintenanceController.getStaffTasks);
router.put('/:id', maintenanceController.updateMaintenanceStatus);
router.delete('/:id', maintenanceController.deleteMaintenanceRequest);

module.exports = router;
