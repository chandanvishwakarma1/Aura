import mongoose from "mongoose";

const positionSchema = new mongoose.Schema({
    followId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Follow',
        required: true,
    },
    symbol:{
        type: String,
        required: true,
    },
    quantity:{
        type: Number,
        requied: true
    },
    currentPrice: {
        type: Number,
        requied: true
    },
    boughtAt: {
        type: Number,
        requied: true
    }
},{timestamps: true})

const Position = mongoose.model('Position', positionSchema)
export default Position;