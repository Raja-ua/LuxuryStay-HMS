const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    permissions: [{ type: String }] // Array of permission keys (e.g. 'view_dashboard', 'manage_rooms')
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
