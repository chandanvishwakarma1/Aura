import { sendEmail } from '../lib/email/email.js';
import { verifyOtp } from '../lib/otp.js';
import { generateOtp, hashOtp } from '../lib/otp.js';
import otpTemplate from '../lib/email/templates/otp.js'
import OtpModel from '../models/OtpModel.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library'

const googleClient = new OAuth2Client("722379224330-4srvaghc8shks1gllnsmos08p2kin7c4.apps.googleusercontent.com")

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" }); //expiress in 15 days
}

const postRegister = async (req, res, next) => {
    try {
        const { username, email, password, userOtp, fullName, experience, riskAppetite, goal, capital, profileIds } = req.body;

        if (!username || !email || !password || !userOtp || !fullName) {
            return res.status(400).json({ message: "All fields are required. " });
        }


        if (username.length < 3) {
            return res.status(400).json({ message: "Username should be atleast 3 characters long. " });
        }

        if (username.length > 20) {
            return res.status(400).json({ message: "Username should be atmost 20 characters long. " });
        }
        const usernameRegex = /^[a-z0-9_.]+$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({ message: "Username can only contain lowercase letters, numbers, underscores, and periods." });
        }

        // Check for consecutive special characters
        if (username.includes('__') || username.includes('..') || username.includes('_.') || username.includes('._')) {
            return res.status(400).json({ message: "Username cannot contain consecutive special characters." });
        }

        // Username cannot start or end with special characters
        if (username.startsWith('_') || username.startsWith('.') ||
            username.endsWith('_') || username.endsWith('.')) {
            return res.status(400).json({ message: "Username cannot start or end with special characters." });
        }
        if (!/\d/.test(password)) return res.status(400).json({ message: "Password must contain atleast one number." });

        if (!/[A-Z]/.test(password)) return res.status(400).json({ message: "Password must contain atleast one Uppercase letter." });

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return res.status(400).json({ message: "Password must contain atleast one Special character." });

        if (password.length < 10) {
            return res.status(400).json({ message: "Passwoord should be atleast 6 characters long. " });
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address." });
        }


        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        await verifyOtp(userOtp, email)
        const isVerified = true;

        //get random avatars
        const profileImage = `https://api.dicebear.com/10.x/waves/svg?seed=${encodeURIComponent(username)}`;

        const initialCapital = Number(capital) || 10000000;

        // Recommended profile ids from onboarding (informational only — no follows created).
        let recommendedIds = []
        if (typeof profileIds === 'string') {
            try { recommendedIds = JSON.parse(profileIds) } catch { recommendedIds = profileIds.split(',').filter(Boolean) }
        } else if (Array.isArray(profileIds)) {
            recommendedIds = profileIds
        }
        recommendedIds = recommendedIds.map(id => String(id)).filter(Boolean)

        const user = new User({
            username,
            email,
            password,
            fullName,
            profileImage,
            isVerified,
            verifiedAt: isVerified ? new Date() : null,
            hasOnboarded: true,
            onBoardedAt: new Date(),
            ...(experience && { experience }),
            ...(riskAppetite && { riskAppetite }),
            ...(goal && { goal }),
            recommendedProfiles: recommendedIds,
            initialCapital,
            availableCapital: initialCapital
        });

        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                profileImage: user.profileImage,
                hasOnboarded: user.hasOnboarded,
                onBoardedAt: user.onBoardedAt,
                experience: user.experience,
                riskAppetite: user.riskAppetite,
                goal: user.goal,
                recommendedProfiles: user.recommendedProfiles,
                initialCapital: user.initialCapital,
                availableCapital: user.availableCapital,
                systemUser: user.systemUser,
                createdAt: user.createdAt,
            }
        })

    } catch (error) {
        console.log("Error registering user: ", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
}
const postCheckUser = async (req,res,next) => {
    try {
        const { email } = req.body;
        if(!email) return res.status(400).json({ success:false,message: 'Email is required'})

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ success:false, message: "Please enter a valid email address." });
        }

        const existingUser = await User.findOne({ email});
        if(existingUser) return res.status(400).json({ success:false, message: "User already exists"})
        
        return res.json({ success: true, message: "User does not exists"})
    } catch (error) {
        console.log("Error checking user: ", error)
        return res.status(500).json({ success: false, message: error.message || "Internal server error"})
    }
}
const postRequestOtp = async (req, res, next) => {
    try {
        const { email, purpose } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "email is required." })
        if (!purpose) return res.status(400).json({ success: false, message: "OTP purpose is required." })

        const serverOtp = generateOtp();
        if (!serverOtp) throw new Error("Failed to generate OTP");

        const otpHash = hashOtp(serverOtp)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await OtpModel.deleteMany({
            ...(email && { email }),
            purpose,
        });

        const otp = new OtpModel({
            email,
            otpHash,
            expiresAt,
            purpose
        })
        await otp.save()

        const subject = `${serverOtp} Your verification code`
        const to = email
        const html = otpTemplate({ otp: serverOtp, expiresIn: 10 });
        await sendEmail(subject, to, html);

        return res.status(200).json({
            success: true,
            message: "Otp sent successfully"
        })
    } catch (error) {
        console.log("Error while requesting otp: ", error);
        return res.status(500).json({ success: false, message: error.message || "Something went wrong" })

    }
}

const postLogin = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if ((!username && !email) || !password) {
            return res.status(400).json({ message: "All fields are requied" });
        }

        const lookupCondition = []
        if (username) lookupCondition.push({ username });
        if (email) lookupCondition.push({ email });

        const existingUser = await User.findOne({ $or: lookupCondition });
        if (!existingUser) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordCorrect = await existingUser.comparePassword(password);
        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials " });

        const token = await generateToken(existingUser._id);

        res.status(200).json({
            token,
            user: {
                _id: existingUser._id,
                username: existingUser.username,
                fullName: existingUser.fullName,
                email: existingUser.email,
                hasOnboarded: existingUser.hasOnboarded,
                profileImage: existingUser.profileImage,
                initialCapital: existingUser.initialCapital,
                availableCapital: existingUser.availableCapital,
                systemUser: existingUser.systemUser,
                createdAt: existingUser.createdAt,
            }
        });

    } catch (error) {
        console.log("Error Loggin in: ", error);
        res.status(500).json({ message: "Internal server error " });
    }


}

const postGoogle = async(req,res,next) => {
    try {
        const {idToken} = req.body;

        if(!idToken){
            return res.status(400).json({ success:false, message: "Missing Google ID Token"})
        }

        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID || "722379224330-4srvaghc8shks1gllnsmos08p2kin7c4.apps.googleusercontent.com"
        })

        const payload = ticket.getPayload()
        if(!payload) {
            return res.status(400).json({ success: false, message: "Invalid token payload"})
        }

        const {email,name,picture, sub: googleId} = payload

        let user = await User.findOne({ email })

        if(!user) {
            return res.json({
                isNewUser: true,
                googleData: {
                    email,
                    fullName: name || '',
                    profileImage: picture || '',
                    googleId
                }
            })
        }

        if(!user.googleId){
            user.googleId = googleId
            await user.save()
        }

        const token = generateToken(user._id)

        return res.status(200).json({
            success: true,
            isNewUser: false,
            token,
            user: {
                _id:user._id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                googleId: googleId,
                profileImage: user.profileImage,
                hasOnboarded: user.hasOnboarded,
                onBoardedAt: user.onBoardedAt,
                experience: user.experience,
                riskAppetite: user.riskAppetite,
                goal: user.goal,
                recommendedProfiles: user.recommendedProfiles,
                initialCapital: user.initialCapital,
                availableCapital: user.availableCapital,
                systemUser: user.systemUser,
                createdAt: user.createdAt
            }
        })
    } catch (error) {
        console.log("Google Auth Backend Error: ", error)
        return res.status(500).json({ success: false, message: "Authentication failed internally" || error.message})
    }
}


const authController = {
    postRegister,
    postCheckUser,
    postLogin,
    postRequestOtp,
    postGoogle
};

export default authController;