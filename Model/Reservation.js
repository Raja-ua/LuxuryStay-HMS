const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    method: { type: String, required: true }, // e.g., 'Cash', 'Credit Card', 'Online'
    date: { type: Date, default: Date.now },
    transactionId: { type: String }
});

const reservationSchema = new mongoose.Schema({
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'early-checkout', 'cancelled'], 
        default: 'pending' 
    },
    totalAmount: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    refundAmount: { type: Number, default: 0 },
    paymentStatus: {
        type: String,
        enum: ['Unpaid', 'Partially Paid', 'Paid', 'Refunded'],
        default: 'Unpaid'
    },
    payments: [paymentSchema]
}, { timestamps: true });

// Pre-save middleware to calculate payment fields automatically
reservationSchema.pre('save', function () {
    // Calculate total paid amount from payments array
    if (this.payments && this.payments.length > 0) {
        this.paidAmount = this.payments.reduce((sum, p) => sum + p.amount, 0);
    } else {
        this.paidAmount = this.paidAmount || 0;
    }

    let diff = this.totalAmount - this.paidAmount;
    
    if (diff < 0) {
        this.remainingAmount = 0;
        this.refundAmount = Math.abs(diff);
        this.paymentStatus = 'Refunded';
    } else {
        this.remainingAmount = diff;
        this.refundAmount = 0;
        if (this.paidAmount === 0) {
            this.paymentStatus = 'Unpaid';
        } else if (this.paidAmount > 0 && this.paidAmount < this.totalAmount) {
            this.paymentStatus = 'Partially Paid';
        } else if (this.paidAmount >= this.totalAmount) {
            this.paymentStatus = 'Paid';
        }
    }
});

module.exports = mongoose.model('Reservation', reservationSchema);
