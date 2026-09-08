const ServiceRequest = require('../Model/ServiceRequest');

exports.createRequest = async (req, res) => {
    try {
        const newRequest = new ServiceRequest(req.body);
        await newRequest.save();
        res.status(201).json({ message: "Service request submitted successfully", data: newRequest });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllRequests = async (req, res) => {
    try {
        const requests = await ServiceRequest.find()
            .populate('guestId', 'fullName email')
            .populate('roomId', 'roomNumber type')
            .populate('assignedTo', 'fullName role')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserRequests = async (req, res) => {
    try {
        const userId = req.params.userId;
        const requests = await ServiceRequest.find({ guestId: userId })
            .populate('roomId', 'roomNumber type')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateRequestStatus = async (req, res) => {
    try {
        const { status, assignedTo } = req.body;
        const updateData = {};
        if (status) updateData.status = status;
        if (assignedTo) updateData.assignedTo = assignedTo;

        const updatedRequest = await ServiceRequest.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedRequest) return res.status(404).json({ message: 'Request not found' });
        res.json({ message: "Request updated", data: updatedRequest });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteRequest = async (req, res) => {
    try {
        const deletedRequest = await ServiceRequest.findByIdAndDelete(req.params.id);
        if (!deletedRequest) return res.status(404).json({ message: 'Request not found' });
        res.json({ message: "Request deleted", data: deletedRequest });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
