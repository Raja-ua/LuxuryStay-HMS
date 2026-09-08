const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
    guestId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    roomId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Room', 
        required: true 
    },
    serviceType: { 
        type: String, 
        required: true,
        enum: ['Room Service', 'Wake-up Call', 'Transport', 'Other'] 
    },
    description: { 
        type: String, 
        required: true 
    },
    requestedTime: { 
        type: Date 
    },
    status: { 
        type: String, 
        enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], 
        default: 'Pending' 
    },
    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Staff' 
    }
}, { timestamps: true });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
