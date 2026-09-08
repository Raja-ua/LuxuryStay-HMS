const mongoose = require('mongoose');

const roundToTwo = (val) => Math.round(Number(val) * 100) / 100;

const billingSchema = new mongoose.Schema({
    reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roomCharges: { type: Number, required: true, set: roundToTwo },
    additionalCharges: { type: Number, default: 0, set: roundToTwo },
    taxAmount: { type: Number, default: 0, set: roundToTwo },
    totalAmount: { type: Number, required: true, set: roundToTwo },
    status: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    issuedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Billing', billingSchema);
