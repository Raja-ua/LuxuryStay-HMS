const express = require('express');
const router = express.Router();
const roomController = require('../Controllers/roomController');
const upload = require('../config/multer'); 

router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);
router.post('/', upload.array('images', 5), roomController.createRoom);
router.put('/:id', upload.array('images', 5), roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);

module.exports = router;
