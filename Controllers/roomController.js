const Room = require('../Model/Room');
const cloudinary = require('../config/cloudinary');

exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createRoom = async (req, res) => {
    try {
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            for (let file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, { folder: "rooms" });
                imageUrls.push(result.secure_url);
            }
        }

        let parsedBeds = [];
        if (req.body.beds) {
            try { parsedBeds = JSON.parse(req.body.beds); } catch(e) {}
        }

        const newRoom = new Room({
            ...req.body,
            beds: parsedBeds,
            features: req.body.features ? req.body.features.split(',') : [],
            images: imageUrls
        });

        await newRoom.save();
        res.status(201).json({ message: "Room created", room: newRoom });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        let imageUrls = room.images || [];
        if (req.files && req.files.length > 0) {
            for (let file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, { folder: "rooms" });
                imageUrls.push(result.secure_url);
            }
        }

        const updatedData = { ...req.body };
        updatedData.images = imageUrls;
        
        if (req.body.features) updatedData.features = req.body.features.split(',');
        if (req.body.beds) {
            try { updatedData.beds = JSON.parse(req.body.beds); } catch(e) {}
        }

        const updatedRoom = await Room.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        res.json({ message: "Room updated", room: updatedRoom });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        const deletedRoom = await Room.findByIdAndDelete(req.params.id);
        if (!deletedRoom) return res.status(404).json({ message: 'Room not found' });
        res.json({ message: "Room deleted", room: deletedRoom });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
