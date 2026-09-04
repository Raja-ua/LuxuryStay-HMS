const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
    bedType: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 }
}, { _id: false });

const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true },
    type: { type: String, required: true }, 
    floor: { type: String },
    capacity: { type: Number },
    description: { type: String },
    beds: [bedSchema],
    status: { 
        type: String, 
        enum: ['available', 'occupied', 'cleaning', 'maintenance'], 
        default: 'available' 
    },
    pricePerNight: { type: Number }, // Kept for billing purposes
    features: [String],
    images: [String], // Array of image URLs
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
