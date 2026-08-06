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
        required: true
    },
    currentPrice: {
        type: Number,
        required: true
    },
    avgPrice: {
        type: Number,
        required: true
    }
},{timestamps: true})

const Position = mongoose.model('Position', positionSchema)
export default Position;