import mongoose from "mongoose";

const disclosureSchema = new mongoose.Schema({
    contextRef: {
        type: String,
        required: true,
        unique: true
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
    marketCap: {
        type: String,
    },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    mode: {
        type: String,
        enum: ["Market Sale", "Open Market", "Market Purchase"],
    },
    disclosedDate: { type: String, required: true },
    filedDate:{ type:String, required :true},
    transactionDate: {type: String, required:true},
    categoryOfPerson: {
        type: String,

    },
    totalTradeValue: {
        type: Number,
        required: true
    },
    profileDisplayTag: {
        type: String,
    },
    systemCopyWeight: {
        type: Number,
    },
    profileTarget: {
        type: String,
        enum: ["INSIDER", "WHALE"],
        required:true
    },
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
disclosureSchema.index({ processed: 1, profileTarget: 1 });
disclosureSchema.index({ symbol: 1, transactionDate: -1 });
disclosureSchema.index({companyName: "text", entityName: "text"})

const Disclosure = mongoose.model("Disclosure", disclosureSchema)
export default Disclosure