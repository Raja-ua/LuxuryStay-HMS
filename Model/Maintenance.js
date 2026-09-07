const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Guest or Admin/Staff
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }, // Housekeeping/Maintenance staff
    issueType: { 
        type: String, 
        enum: ['Cleaning', 'Repair', 'Supply Request', 'Other'], 
        required: true 
    },
    description: { type: String, required: true },
    priority: { 
        type: String, 
        enum: ['Low', 'Medium', 'High', 'Urgent'], 
        default: 'Medium' 
    },
    status: { 
        type: String, 
        enum: ['Pending', 'In Progress', 'Resolved'], 
        default: 'Pending' 
    },
    resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
