const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String }, // optional
    contactNumber: { type: String },
    dateOfBirth: { type: Date }, // optional
    city: { type: String },
    address: { type: String },
    image: { type: String }, // From Cloudinary
    assignWork: { type: String },
    role: { type: String, required: true },
    joiningDate: { type: Date },
    shift: { type: String },
    salary: { type: Number },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
