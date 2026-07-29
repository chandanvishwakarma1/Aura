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
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["open", "closed", "skipped"],
        required: true
    },
    rejectionReason:{
        type:String,
        enum: ["SLIPPAGE_EXCEEDED", "INSUFFICIENT_FUNDS", null],
        default: null
    },
    exitPrice: {
        type: Number,
        default:null
    },
    pnlAtClose: {
        type: Number
    },
    triggerRefId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QueuedIntent'
    }
},{timestamps: true})
tradeSchema.index({followId:1,status:1})
const Trade = mongoose.model('Trade', tradeSchema)
export default Trade;