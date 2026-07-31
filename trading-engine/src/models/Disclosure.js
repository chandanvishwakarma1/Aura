import mongoose from "mongoose";

const disclosureSchema = new mongoose.Schema({
    contextRef: {
        type: String,
        required: true
    },
    companyName:{
        type: String,
        required: true
    },
    source: {
        type: String,
        enum: ["nse_bulk", "nse_block", "nse_insider"],
        required: true
    },
    exchange: {
        type: String,
        enum: ["NSE", "BSE"],
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    entityName: {
        type: String,
        required:true
    },
    transactionType: {
        type:String,
        enum: ["Buy", "Sell"],
        required:true
    },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    mode: {
        type: String,
        enum: ["Market Sale", "Open Market", "Market Purchase"],
        required: true
    },
    disclosedDate: { type: Date, required: true },
    filedDate:{ type:Date, required :true},
    transactionDate: {type: Date, required:true},
    processed: { type: Boolean, default: false },
    isCorporateEntity:{type : Boolean, default:false},
    rawPayload: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
}, {timestamps: true})
disclosureSchema.index({ 
    source: 1, 
    entityName: 1, 
    symbol: 1, 
    disclosedDate: 1, 
    contextRef: 1, 
    exchange: 1 
}, { unique: true });

const Disclosure = mongoose.model("Disclosure", disclosureSchema)
export default Disclosure