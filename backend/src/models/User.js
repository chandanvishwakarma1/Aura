import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 20,
    },
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    profileImage: {
        type: String,
        default: ""
    },
    deviceToken: {
        type: String,
        default: null
    },
    notificationEnabled: {
        type: Boolean,
        default: true
    },
    availableCapital: {
        type: Number,
        default: 10000000
    },
    hasOnboarded: {
        type: Boolean,
        default: false,
    },
    onBoardedAt: {
        type: Date,
    },
    experience: {
        type: String,
        enum: ['new', 'some,', 'experienced', 'professional'],
    },
    riskAppetite: {
        type: String,
        enum: ['conservative', 'balanced', 'growth', 'aggressive']
    },
    goal: { type: String, enum:['learn trading', 'improve trading', 'just exploring'], default: [] },
    initialCapital: {
        type: Number,
        default: 10000000
    },
    systemUser: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
})

userSchema.methods.comparePassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password);
}

const User = mongoose.model('User', userSchema);

export default User;