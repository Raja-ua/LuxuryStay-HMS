const Notification = require('../Model/Notification');

exports.createNotification = async (req, res) => {
    try {
        const notification = new Notification(req.body);
        await notification.save();
        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getNotificationsForRole = async (req, res) => {
    try {
        const { role } = req.params;
        // Fetch notifications for 'all' or for the specific role
        const notifications = await Notification.find({
            $or: [{ recipientRole: 'all' }, { recipientRole: role }]
        }).sort({ createdAt: -1 }).limit(20);
        
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const updated = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const { role } = req.params;
        await Notification.updateMany({
            $or: [{ recipientRole: 'all' }, { recipientRole: role }],
            isRead: false
        }, { isRead: true });
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
