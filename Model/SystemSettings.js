const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
    hotelName: { type: String, default: 'LuxuryStay Hotel' },
    taxRate: { type: Number, default: 10 }, // 10%
    weekendSurcharge: { type: Number, default: 10 }, // 10%
    holidaySurcharge: { type: Number, default: 15 }, // 15%
    holidays: [{
        date: { type: String }, // e.g. "2026-12-25"
        name: { type: String } // e.g. "Christmas"
    }],
    checkoutTime: { type: String, default: '12:00 PM' },
    cancellationPolicy: { type: String, default: 'Free cancellation up to 24 hours before check-in.' }
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
