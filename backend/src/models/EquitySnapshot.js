import mongoose from "mongoose";

const equitySnapshotSchema = new mongoose.Schema({
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required:true
    },
    date: {
        type: Date,
        required: true,
    },
    cumulativeMultiplier: {
        type: Number,
        required:true
    },
    cumulativeReturnPercent: {
        type: Number,
        required: true
    }
}, {timestamps: true})

const EquitySnapshot = mongoose.model('EquitySnapshot', equitySnapshotSchema)
export default EquitySnapshot;