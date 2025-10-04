// src/models/User.js
const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
	fullName: { type: String, required: true },
	email: { type: String, required: true, unique: true, lowercase: true },
	password: { type: String, required: true },
	role: { type: String, enum: ['voter', 'admin'], default: 'voter' },
	region: { type: String },
	eligibility: { type: String, enum: ['Eligible', 'Already Voted', 'Not Eligible'], default: 'Eligible' },
	voteReceipt: { type: String },
	qrCode: { type: String },
	history: [{ type: String }],
	receiptHash: { type: String },
	createdAt: { type: Date, default: Date.now },
	resetPasswordToken: String,
	resetPasswordExpires: Date,
});


module.exports = mongoose.model('User', userSchema);