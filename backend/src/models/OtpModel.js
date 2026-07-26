import mongoose from 'mongoose'

const otpModelSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        trim: true,
        index: true,
        required: false,
    },
    otpHash: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } //TTL index
    },
    attempts: {
        type: Number,
        default: 0,
        max: 5,
    },
    purpose: {
        type: String,
        enum: ['reset_password', 'verify_email'],
        required: true,
    },
    resendCount: {
        type: Number,
        default: 0,
    }
},{timestamps: true});

otpModelSchema.index({ email: 1, purpose: 1 }, { unique: true });

const OtpModel = mongoose.models.OtpModel || mongoose.model('OtpModel', otpModelSchema);
export default OtpModel;
