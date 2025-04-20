const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')
require('dotenv').config(); // Load environment variables

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter name']
    },
    email: {
        type: String,
        required: [true, 'Please enter email'],
        unique: true,
        validate: [validator.isEmail, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please enter password'],
        maxlength: [6, 'Password cannot exceed 6 characters'],
        select: false
    },
    avatar: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user'
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordTokenExpire: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving function
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Prevent re-hashing if unchanged
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Generate JWT Token function
userSchema.methods.getJwtToken = function () {
    return jwt.sign(
        { id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE_TIME }
    );
};

// password forgot and reset token
userSchema.methods.getResetToken = function () {
    //Generate Token
    const token = crypto.randomBytes(20).toString('hex');

    //Generate Hash and set to resetPasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    //Set token expire time
    this.resetPasswordTokenExpire = Date.now() + 30 * 60 * 1000;

    return token
}






const User = mongoose.model('User', userSchema);
module.exports = User;
