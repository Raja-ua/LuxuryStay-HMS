const express = require('express');
const router = express.Router();
const staffController = require('../Controllers/staffController');
const upload = require('../config/multer'); 

router.get('/', staffController.getAllStaff);
router.get('/:id', staffController.getStaffById);
router.post('/', upload.single('image'), staffController.createStaff);
router.put('/:id', upload.single('image'), staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

module.exports = router;
