import mongoose from "mongoose";

const followSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required:true,
    },
    followedAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    capitalAllocated: {
        type: Number,
        required: true,
    }
}, {timestamps: true})

const Follow = mongoose.model('Follow', followSchema)
export default Follow;