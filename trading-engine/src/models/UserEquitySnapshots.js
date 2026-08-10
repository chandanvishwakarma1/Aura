import mongoose from "mongoose";

const userEquitySnapshotSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    date: {
        type: Date,
        required: true,
    },
    totalEquity: {
        type: Number,
        required:true
    },
    totalCapitalAllocated: {
        type: Number,
        required: true
    },
    totalReturnPercent: {
        type: Number,
        required: true
    }
}, {timestamps: true})

userEquitySnapshotSchema.index({userId:1,date:1},{unique: true})

const UserEquitySnapshot = mongoose.model('UserEquitySnapshot', userEquitySnapshotSchema)
export default UserEquitySnapshot;