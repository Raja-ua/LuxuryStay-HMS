const Feedback = require('../Model/Feedback');

exports.getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().populate('guestId');
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getFeedbackById = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id).populate('guestId');
        if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createFeedback = async (req, res) => {
    try {
        const newFeedback = new Feedback(req.body);
        await newFeedback.save();
        res.status(201).json({ message: "Feedback created", feedback: newFeedback });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateFeedback = async (req, res) => {
    try {
        const updatedFeedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedFeedback) return res.status(404).json({ message: 'Feedback not found' });
        res.json({ message: "Feedback updated", feedback: updatedFeedback });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteFeedback = async (req, res) => {
    try {
        const deletedFeedback = await Feedback.findByIdAndDelete(req.params.id);
        if (!deletedFeedback) return res.status(404).json({ message: 'Feedback not found' });
        res.json({ message: "Feedback deleted", feedback: deletedFeedback });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
