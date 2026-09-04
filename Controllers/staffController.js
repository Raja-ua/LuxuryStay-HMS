const Staff = require('../Model/Staff');
const cloudinary = require('../config/cloudinary');

exports.getAllStaff = async (req, res) => {
    try {
        const staffList = await Staff.find();
        res.json(staffList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStaffById = async (req, res) => {
    try {
        const staffMember = await Staff.findById(req.params.id);
        if (!staffMember) return res.status(404).json({ message: 'Staff member not found' });
        res.json(staffMember);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createStaff = async (req, res) => {
    try {
        let imageUrl = "";
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "staff"
            });
            imageUrl = result.secure_url;
        }

        const newStaff = new Staff({
            ...req.body,
            image: imageUrl || req.body.image
        });

        await newStaff.save();
        res.status(201).json({ message: "Staff created", staff: newStaff });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateStaff = async (req, res) => {
    try {
        let imageUrl = req.body.image;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "staff"
            });
            imageUrl = result.secure_url;
        }

        const updatedData = { ...req.body };
        if (imageUrl) updatedData.image = imageUrl;

        const updatedStaff = await Staff.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        if (!updatedStaff) return res.status(404).json({ message: 'Staff member not found' });

        res.json({ message: "Staff updated", staff: updatedStaff });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteStaff = async (req, res) => {
    try {
        const deletedStaff = await Staff.findByIdAndDelete(req.params.id);
        if (!deletedStaff) return res.status(404).json({ message: 'Staff member not found' });
        res.json({ message: "Staff deleted", staff: deletedStaff });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
