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
    risk: {
        type: Number,
        required: true,
        default: 0.1,
        min:0,
        max:1
    },
    slippage:{
        type: Number,
        default: 0.01,
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
followSchema.index({userId:1,profileId:1})
const Follow = mongoose.model('Follow', followSchema)
export default Follow;