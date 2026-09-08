const SystemSettings = require('../Model/SystemSettings');

exports.getSettings = async (req, res) => {
    try {
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = new SystemSettings();
            await settings.save();
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = new SystemSettings(req.body);
            await settings.save();
        } else {
            settings = await SystemSettings.findByIdAndUpdate(settings._id, req.body, { new: true });
        }
        res.json({ message: "Settings updated successfully", data: settings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
