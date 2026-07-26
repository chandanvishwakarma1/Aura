import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema({
    followId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Follow',
        required: true,
    },
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    symbol:{
        type: String,
        required: true,
    },
    side: {
        type: String,
        enum: ['BUY', 'SELL'],
        required: true,
    },
    quantity:{
        type: Number,
        requied: true
    },
    price: {
        type: Number,
        requied: true
    },
    status: {
        type: String,
        enum: ["open", "closed"],
        required: true
    },
    pnlAtClose: {
        type: Number
    },
    triggerRefId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Disclosure'
    }
},{timestamps: true})

const Trade = mongoose.model('Trade', tradeSchema)
export default Trade;