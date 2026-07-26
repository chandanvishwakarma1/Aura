//Internal module
import crypto from 'crypto';
import OtpModel from '../models/OtpModel.js';

export const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); //6 digits
}
export const hashOtp = (userOtp) => {
    return crypto.createHash("sha256").update(userOtp).digest("hex");
}
export const verifyOtp = async (userOtp, email) => {
    const record = await OtpModel.findOne({ email });
    if (!record) throw new Error("OTP not found");

    if (record.expiresAt < new Date()) throw new Error("OTP Expired");
    if (record.attempts >= 5) throw new Error("Too many attempts");

    const incomingHash = hashOtp(userOtp);
    const isValid = crypto.timingSafeEqual(
        Buffer.from(incomingHash, 'utf8'),
        Buffer.from(record.otpHash, 'utf8')
    );
    if (!isValid) {
        await OtpModel.updateOne({ email }, { $inc: { attempts: 1 } });
        throw new Error("Invalid OTP");
    }

    await OtpModel.findOneAndDelete({ email });
}