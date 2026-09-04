const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
    reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roomCharges: { type: Number, required: true },
    additionalCharges: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    issuedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Billing', billingSchema);
