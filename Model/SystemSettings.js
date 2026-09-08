const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
    hotelName: { type: String, default: 'LuxuryStay Hotel' },
    taxRate: { type: Number, default: 10 }, // 10%
    currency: { type: String, default: 'USD' },
    checkoutTime: { type: String, default: '12:00 PM' },
    cancellationPolicy: { type: String, default: 'Free cancellation up to 24 hours before check-in.' }
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
