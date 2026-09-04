const Billing = require('../Model/Billing');

exports.getAllBillings = async (req, res) => {
    try {
        const billings = await Billing.find().populate('reservationId').populate('guestId');
        res.json(billings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBillingById = async (req, res) => {
    try {
        const billing = await Billing.findById(req.params.id).populate('reservationId').populate('guestId');
        if (!billing) return res.status(404).json({ message: 'Billing not found' });
        res.json(billing);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createBilling = async (req, res) => {
    try {
        const newBilling = new Billing(req.body);
        await newBilling.save();
        res.status(201).json({ message: "Billing created", billing: newBilling });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateBilling = async (req, res) => {
    try {
        const updatedBilling = await Billing.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedBilling) return res.status(404).json({ message: 'Billing not found' });
        res.json({ message: "Billing updated", billing: updatedBilling });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteBilling = async (req, res) => {
    try {
        const deletedBilling = await Billing.findByIdAndDelete(req.params.id);
        if (!deletedBilling) return res.status(404).json({ message: 'Billing not found' });
        res.json({ message: "Billing deleted", billing: deletedBilling });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
