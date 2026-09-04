const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    contactNumber: String,
    cnic: String,
    nationality: String,
    city: String,
    address: String,
    role: { 
        type: String, 
        default: 'guest' 
    },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    image: String, // From Cloudinary
}, { timestamps: true });

userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
