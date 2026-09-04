const Reservation = require('../Model/Reservation');
const Room = require('../Model/Room');
const User = require('../Model/User');
const { Vonage } = require('@vonage/server-sdk');
const { Channels } = require('@vonage/messages');

const vonage = new Vonage({
  apiKey: "7dc385e5",
  apiSecret: "vuYzV9jdFFJAVXwt"
});

exports.getAllReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find().populate('guestId').populate('roomId');
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getReservationById = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate('guestId').populate('roomId');
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        res.json(reservation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createReservation = async (req, res) => {
    try {
        const { 
            roomId, checkInDate, checkOutDate, totalAmount, status,
            fullName, email, contactNumber, cnic, nationality, city, address, guestId,
            initialPaymentAmount, paymentMethod, transactionId
        } = req.body;

        let finalGuestId = guestId;

        if (email || cnic) {
            let user = null;
            if (guestId) user = await User.findById(guestId);
            else user = await User.findOne({ $or: [{ email }, { cnic }] });

            const userData = { fullName, email, contactNumber, cnic, nationality, city, address, role: 'guest' };

            if (user) {
                user = await User.findByIdAndUpdate(user._id, userData, { new: true });
                finalGuestId = user._id;
            } else {
                const newUser = new User(userData);
                await newUser.save();
                finalGuestId = newUser._id;
            }
        }

        if (!finalGuestId) return res.status(400).json({ message: "Guest details or guestId required." });

        let payments = [];
        if (initialPaymentAmount && Number(initialPaymentAmount) > 0) {
            payments.push({
                amount: Number(initialPaymentAmount),
                method: paymentMethod || 'Cash',
                transactionId: transactionId || ''
            });
        }

        const newReservation = new Reservation({
            roomId, checkInDate, checkOutDate, totalAmount, status, guestId: finalGuestId, payments
        });
        await newReservation.save();

        // Update room status
        if (['pending', 'confirmed', 'checked-in'].includes(newReservation.status)) {
            await Room.findByIdAndUpdate(newReservation.roomId, { status: 'occupied' });
        }

        res.status(201).json({ message: "Reservation created", reservation: newReservation });

        // SMS Sending Logic
        try {
            const guest = await User.findById(finalGuestId);
            const bookedRoom = await Room.findById(roomId);
            if (guest && guest.contactNumber) {
                let phoneStr = guest.contactNumber.replace(/\D/g, '');
                if (phoneStr.startsWith('0')) {
                    phoneStr = '92' + phoneStr.substring(1);
                }

                const smsText = `Hello ${guest.fullName || guest.name || 'Guest'}, your booking for Room ${bookedRoom ? bookedRoom.roomNumber : ''} at LuxuryStay is confirmed. Check-in: ${new Date(checkInDate).toLocaleDateString()}. Total: $${totalAmount}. Thank you!`;

                vonage.messages.send({
                    messageType: 'text',
                    channel: Channels.SMS,
                    text: smsText,
                    to: phoneStr,
                    from: "LuxuryStay"
                })
                .then(({ messageUUID }) => console.log('SMS sent successfully, UUID:', messageUUID))
                .catch((error) => console.error('Error sending SMS:', error));
            }
        } catch (smsError) {
            console.error('Failed to prepare SMS:', smsError);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

        // Update fields
        Object.keys(req.body).forEach(key => {
            reservation[key] = req.body[key];
        });

        await reservation.save(); // Triggers pre('save') for payment calculations

        if (['pending', 'confirmed', 'checked-in'].includes(reservation.status)) {
            await Room.findByIdAndUpdate(reservation.roomId, { status: 'occupied' });
        } else if (['checked-out', 'early-checkout', 'cancelled'].includes(reservation.status)) {
            await Room.findByIdAndUpdate(reservation.roomId, { status: 'available' });
        }

        res.json({ message: "Reservation updated", reservation });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteReservation = async (req, res) => {
    try {
        const deletedReservation = await Reservation.findByIdAndDelete(req.params.id);
        if (!deletedReservation) return res.status(404).json({ message: 'Reservation not found' });

        await Room.findByIdAndUpdate(deletedReservation.roomId, { status: 'available' });

        res.json({ message: "Reservation deleted", reservation: deletedReservation });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addPayment = async (req, res) => {
    try {
        const { amount, method, transactionId } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid payment amount" });

        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) return res.status(404).json({ message: "Reservation not found" });

        reservation.payments.push({
            amount: Number(amount),
            method: method || 'Cash',
            transactionId: transactionId || ''
        });

        await reservation.save(); // This will trigger pre('save') to recalculate fields

        if (reservation.paymentStatus === 'Paid') {
            const Billing = require('../Model/Billing');
            await Billing.findOneAndUpdate(
                { reservationId: reservation._id },
                { status: 'paid' }
            );
        }

        res.json({ message: "Payment added successfully", reservation });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
