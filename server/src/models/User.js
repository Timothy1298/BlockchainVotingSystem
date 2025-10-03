// src/models/User.js
const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
fullName: { type: String, required: true },
email: { type: String, required: true, unique: true, lowercase: true },
password: { type: String, required: true },
role: { type: String, enum: ['voter', 'admin'], default: 'voter' },
createdAt: { type: Date, default: Date.now },
resetPasswordToken: String,
resetPasswordExpires: Date,
});


module.exports = mongoose.model('User', userSchema);