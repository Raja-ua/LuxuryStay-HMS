const express = require('express');
const router = express.Router();
const contactController = require('../Controllers/contactController');

router.post('/', contactController.createContact);
router.get('/', contactController.getAllContacts);
router.put('/:id', contactController.updateContactStatus);
router.delete('/:id', contactController.deleteContact);

module.exports = router;
