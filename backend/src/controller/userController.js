import Follow from "../models/Follow.js";
import User from "../models/User.js";
import Position from '../models/Position.js'
import { fetchBatchMarketPrices } from '../lib/price.js'
import Trade from "../models/Trade.js";

const checkUsername = async (req, res, next) => {
    try {
        const { username } = req.body;

        if (!username) return res.status(400).json({ message: "Username is required", success: false }
        )
        if (username.length < 3) return res.status(400).json({ message: "Username should be atleast 3 characters long.", success: false })
        if (username.length > 20) return res.status(400).json({ message: "Username should be atmost 20 characters long.", success: false })

        const isAvailable = await User.exists({ username });
        if (isAvailable) return res.status(400).json({ message: "Username already taken", success: false })

        return res.json({
            success: true,
            message: "Username available"
        })
    } catch (error) {
        console.log("Error checking username: ", error)
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

const getPortfolioSummary = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        const follows = await Follow.find({ userId }).lean()

        if (follows.length === 0) return res.status(400).json({ success: false, totalEquity: 0, totalCapitalAllocated: 0, follows: [] })
        let totalEquity = 0
        let totalCapitalAllocated = 0
        const followBreakdown = []

        for(const follow of follows){
            const realizedResult = await Trade.aggregate([
                {$match: {followId: follow._id, status:'closed'}},
                {$group: {_id:null, total: {$sum: "$pnlAtClose"}}}
            ])
            const realizedPnl = realizedResult.length > 0 ? realizedResult[0].total:0

            const openPositions = await Position.find({followId: follow._id}).lean()
            let unrealizedPnl = 0
            if(openPositions.length > 0){
                const symbols = [...new Set(openPositions.map(p => p.symbol))]
                const liveprices = await fetchBatchMarketPrices(symbols)
                for(const pos of openPositions){
                    const price = liveprices[pos.symbol]
                    if(!price){
                        console.log(`No price for ${pos.symbol} - skipping`)
                        continue
                    }
                    unrealizedPnl += (price - pos.avgPrice) * pos.quantity
                }
            }

            const followValue = follow.capitalAllocated + realizedPnl + unrealizedPnl
            totalEquity+=followValue
            totalCapitalAllocated+=follow.capitalAllocated

            followBreakdown.push({
                followId: follow._id,
                profileId: follow.profileId,
                capitalAllocated: follow.capitalAllocated,
                currentValue: followValue,
                pnl: followValue - follow.capitalAllocated
            })
        }

        const totalReturnPercent = totalCapitalAllocated > 0 
        ? Number(((totalEquity - totalCapitalAllocated) / totalCapitalAllocated) * 100 ).toFixed(2)
        : 0

        return res.json({
            success: true,
            userId,
            totalEquity,
            totalCapitalAllocated,
            totalReturnPercent,
            follows: followBreakdown
        })

    } catch (error) {
        console.log("Error computing portfolio summary: ", error)
        return res.status(500).json({ success:false, message: error.message || "Internal sever error."})
    }
}


const userController = {
    checkUsername,
    getPortfolioSummary
}

export default userController;