import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protectedRoute = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        if (!token) return res.status(401).json({ message: "No authentication token, access denied" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.userId).select('-password')

        if (!user) return res.status(401).json({ message: "Token is not valid." })

        req.user = user;
        next();
    } catch (error) {
        console.log("Authentication error: ", error)
        return res.status(401).json({ message: "Token is not valid." })
    }
}

/**
 * Validates server-to-server requests (e.g. from the trading engine) using a
 * shared secret header instead of a user JWT. The trading engine has no user
 * token but legitimately needs to notify a user whose follow executed a trade.
 */
const internalRoute = (req, res, next) => {
    const key = req.get('x-internal-key')
    if (!key || key !== process.env.INTERNAL_KEY) {
        return res.status(401).json({ success: false, message: "Unauthorized internal request" })
    }
    next()
}

export default protectedRoute;
export { internalRoute };