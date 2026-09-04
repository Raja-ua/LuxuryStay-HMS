const express = require('express');
const router = express.Router();
const reservationController = require('../Controllers/reservationController');

router.get('/', reservationController.getAllReservations);
router.get('/:id', reservationController.getReservationById);
router.post('/', reservationController.createReservation);
router.put('/:id', reservationController.updateReservation);
router.delete('/:id', reservationController.deleteReservation);

router.post('/:id/payments', reservationController.addPayment);

module.exports = router;
