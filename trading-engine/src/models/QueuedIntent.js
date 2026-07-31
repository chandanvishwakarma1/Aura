import mongoose from "mongoose";

const queuedIntentSchema = new mongoose.Schema({
    symbol:{
        type: String,
        required: true
    },
    profileId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true,
    },
    decisionPrice:{
        type: Number,
        required: true
    },
    side: {
        type: String,
        enum: ['Buy', 'Sell'],
        required: true
    },
    orderType:{
        type: String,
        enum: ['Market', 'Limit', 'AMO'],
        default: 'Market',required:true
    },
    status: {
        type: String,
        enum:["pending", "executed"],
        default: "pending"
    },

}, { timestamps:true})

const QueuedIntent = mongoose.model('QueuedIntent', queuedIntentSchema)
export default QueuedIntent;