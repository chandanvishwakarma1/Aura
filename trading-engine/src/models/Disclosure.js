import mongoose from "mongoose";

const disclosureSchema = new mongoose.Schema({
    source: {
        type: String,
        enum: ["nse_bulk", "nse_block", "nse_insider"],
        required: true
    },
    entityName: {
        type: String,
        required:true
    },
    symbol: {
        type: String,
        required: true
    },
    transactionType: {
        type:String,
        enum: ["buy", "sell"],
        required:true
    },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    disclosedDate: { type: Date, required: true },
    processed: { type: Boolean, default: false },
    rawPayload: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
}, {timestamps: true})

const Disclosure = mongoose.model("Disclosure", disclosureSchema)
export default Disclosure