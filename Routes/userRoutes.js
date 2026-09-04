const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');
const upload = require('../config/multer'); 

router.get('/', userController.getAllUsers);
router.post('/login', userController.loginUser);
router.get('/:id', userController.getUserById);
router.post('/', upload.single('image'), userController.createUser);
router.put('/:id', upload.single('image'), userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
