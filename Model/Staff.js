const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, unique: true, sparse: true }, 
    password: { type: String },
    contactNumber: { type: String },
    dateOfBirth: { type: Date }, 
    city: { type: String },
    address: { type: String },
    image: { type: String }, 
    assignWork: { type: String },
    role: { type: String, required: true },
    joiningDate: { type: Date },
    shift: { type: String },
    salary: { type: Number },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

staffSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

staffSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Staff', staffSchema);
