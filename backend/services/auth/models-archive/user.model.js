import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type:String,
        required: true,
        unique: true,
    },
    password: {
        type:String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // We just put a couple of more fields
    resetPasswordToken: String, // so when user wants to update a password 
    resetPasswordTokenExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
}, {timestamps: true}); // this timestamps automatically lets you use createdAt and updatedAt

export const User = mongoose.model('User', userSchema);