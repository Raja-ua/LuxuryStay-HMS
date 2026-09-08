const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientRole: { 
        type: String, 
        required: true,
        default: 'admin' // can be 'admin', 'housekeeping', 'maintenance', 'all', or specific user ID if needed
    },
    title: { 
        type: String, 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    isRead: { 
        type: Boolean, 
        default: false 
    },
    link: { 
        type: String 
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
