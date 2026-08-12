import Follow from "../models/Follow.js";
import User from "../models/User.js";
import Position from '../models/Position.js'
import getCurrentPrice, { fetchBatchMarketPrices, getYesterdayPrice } from '../lib/price.js'
import Trade from "../models/Trade.js";
import UserEquitySnapshot from "../models/UserEquitySnapshots.js";
import Profile from "../models/Profile.js";
import computeUserEquity from "../lib/computeUserEquity.js";



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
const getHomeSummary = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const result = await computeUserEquity(userId)
        if (!result) return res.json({ success: true, totalEquity: 0, activeCopies: 0, hasYesterdayData: false })
        const { totalEquity, followCount } = result
        const today = new Date()
        today.setUTCHours(0, 0, 0, 0)

        const yesterdaySnapShot = await UserEquitySnapshot.findOne({
            userId,
            date: { $lt: today }
        }).sort({ date: -1 }).lean()

        let todayAmountChange = null
        let todayPercentChange = null

        if (yesterdaySnapShot) {
            todayAmountChange = Number((totalEquity - yesterdaySnapShot.totalEquity).toFixed(2))
            todayPercentChange = Number(((totalEquity - yesterdaySnapShot.totalEquity) / yesterdaySnapShot.totalEquity * 100).toFixed(2))

        }
        return res.json({
            success: true,
            totalEquity,
            activeCopies: followCount,
            todayAmountChange,
            todayPercentChange,
            hasYesterdayData: !!yesterdaySnapShot
        })
    } catch (error) {
        console.log("Error fetching home summary: ", error)
        return res.status(500).json({ success: false, message: error.message || "Internal sever error." })
    }
}
const getPortfolioSummary = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const follows = await Follow.find({ userId }).lean()

        if (follows.length === 0) return res.json({ success: false, totalEquity: 0, totalCapitalAllocated: 0, follows: [], flattenedPositions: [] })

        const followsIds = follows.map(f => f._id)

        const realizedResult = await Trade.aggregate([
            { $match: { followId: { $in: followsIds }, status: 'closed' } },
            { $group: { _id: "$followId", total: { $sum: "$pnlAtClose" } } }
        ])

        const realizedPnlMap = Object.fromEntries(realizedResult.map(r => [r._id.toString(), r.total]))
        const allPositions = await Position.find({ followId: { $in: followsIds } }).lean()

        let liveprices = {}
        if (allPositions.length > 0) {
            const allSymbols = [...new Set(allPositions.map(p => p.symbol))]
            liveprices = await fetchBatchMarketPrices(allSymbols)
        }

        const positionsByFollowMap = {}
        allPositions.forEach(pos => {
            const fId = pos.followId.toString()
            if (!positionsByFollowMap[fId]) positionsByFollowMap[fId] = []
            positionsByFollowMap[fId].push(pos)
        })

        let totalEquity = 0
        let totalCapitalAllocated = 0
        const profilesBreakdown = []
        const followBreakdown = []
        const flattenedPositions = []

        const profiles = await Profile.find().lean()

        for (const follow of follows) {
            const followIdStr = follow._id.toString()

            const realizedPnl = realizedPnlMap[followIdStr] || 0
            const openPositions = positionsByFollowMap[followIdStr] || []


            let unrealizedPnl = 0
            if (openPositions.length > 0) {
                for (const pos of openPositions) {
                    const price = liveprices[pos.symbol]
                    if (!price) {
                        console.log(`No price for ${pos.symbol} - skipping`)
                        continue
                    }
                    const singlePosPnl = (price - pos.avgPrice) * pos.quantity
                    unrealizedPnl += singlePosPnl
                    for (const profile of profiles) {
                        if (profile._id.toString() === follow.profileId.toString()) {

                            flattenedPositions.push({
                                ...pos,
                                currentPrice: price,
                                profileId: follow.profileId,
                                profileImage: profile.profileImage,
                                unrealizedPnl: singlePosPnl.toFixed(2)
                            })
                        }
                    }


                }
            }

            const followValue = follow.capitalAllocated + realizedPnl + unrealizedPnl
            totalEquity += followValue
            totalCapitalAllocated += follow.capitalAllocated

            followBreakdown.push({
                followId: follow._id,
                profileId: follow.profileId,
                capitalAllocated: follow.capitalAllocated.toFixed(2),
                currentValue: followValue.toFixed(2),
                pnl: (followValue - follow.capitalAllocated).toFixed(2)
            })

            for (const profile of profiles) {
                if (profile._id.toString() === follow.profileId.toString()) {
                    profilesBreakdown.push({
                        profileId: follow.profileId,
                        profileImage: profile.profileImage,
                        name: profile.name,
                        capitalAllocated: follow.capitalAllocated.toFixed(2),
                        currentValue: followValue.toFixed(2),
                        pnl: (followValue - follow.capitalAllocated).toFixed(2)
                    })
                }
            }
        }

        const totalReturnPercent = totalCapitalAllocated > 0
            ? Number((((totalEquity - totalCapitalAllocated) / totalCapitalAllocated) * 100).toFixed(2))
            : 0

        return res.json({
            success: true,
            userId,
            totalEquity: totalEquity.toFixed(2),
            totalCapitalAllocated: totalCapitalAllocated.toFixed(2),
            totalReturnPercent: totalReturnPercent.toFixed(2),
            follows: followBreakdown,
            profiles: profilesBreakdown,
            flattenedPositions
        })

    } catch (error) {
        console.log("Error computing portfolio summary: ", error)
        return res.status(500).json({ success: false, message: error.message || "Internal sever error." })
    }
}
const RANGE_DAYS = {
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
    'ALL': null //all
}

const getUserReturns = async (req, res, next) => {
    try {
        const userId = req.user._id
        const range = (req.query.range || '1M').toUpperCase()

        if (!(range in RANGE_DAYS)) {
            return res.status(400).json({ success: false, message: 'Invalid range. Use 1W, 1M, 3M, 6M, 1Y, ALL' })
        }

        const rangeDays = RANGE_DAYS[range]
        let queryFilter = { userId }
        let requestedStart = null

        if (rangeDays !== null) {
            requestedStart = new Date()
            requestedStart.setDate(requestedStart.getDate() - rangeDays)
            queryFilter.date = { $gte: requestedStart }
        }
        //oldest
        let windowSnapshot = await UserEquitySnapshot.find(queryFilter).sort({ date: 1 }).lean()

        let hasFullHistory = true;
        if (windowSnapshot.length === 0 && rangeDays !== null) {
            windowSnapshot = await UserEquitySnapshot.find({ userId }).sort({ date: 1 }).lean()
            hasFullHistory = false;
        } else if (rangeDays !== null && windowSnapshot.length > 0) {
            hasFullHistory = windowSnapshot[0].date <= new Date(requestedStart.getTime() + 86400000)
        }

        if (windowSnapshot.length === 0) {
            return res.json({ success: true, range, data: [], hasFullHistory: false })
        }
        //rebase:
        const baseEquity = windowSnapshot[0].totalEquity
        const rebased = windowSnapshot.map(s => ({
            date: s.date,
            value: Math.round(((s.totalEquity / baseEquity) - 1) * 10000) / 100 //% to 2decimal
        }))


        return res.json({ success: true, range, data: rebased, hasFullHistory })


    } catch (error) {
        console.log("Error fetching user returns: ", error)
        return res.status(500).json({ success: false, message: error.message || "Internal server error" })
    }
}

const getUpdatedUser = async (req, res, next) => {
    try {
        const { id: userId } = req.params

        const user = await User.findById({ _id: userId }).select('-password').lean()
        if (!user) return res.status(404).json({ success: false, message: "User not found" })

        return res.json({ success: true, user })
    } catch (error) {
        console.log('Error fetching updated user: ', error)
        return res.status(500).json({ success: false, message: error.message || "Internal server error" })
    }
}
const getTrades = async (req, res, next) => {
    try {
        const userId = req.user._id
        const follows = await Follow.find({ userId })
        if (follows.length === 0) return res.status(400).json({ success: false, message: "No follows found" })
        const followIds = follows.map(f => f._id)
        const trades = await Trade.find({ followId: { $in: followIds } })
            .populate('profileId', 'name profileImage')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()
        if (trades.length === 0) return res.status(400).json({ success: false, message: "No trades found" })
        return res.json({ success: true, trades })
    } catch (error) {
        console.log("Error fetching trades: ", error)
        return res.status(500).json({ success: false, message: error.message || "Internal server error" })
    }
}
const getTradeById = async (req, res, next) => {
    try {
        const tradeId = req.params.id
        const userId = req.user._id

        if (!tradeId) return res.status(400).json({ success: false, message: "Trade id is required" })


        const user = await User.findOne({ _id: userId }).select('_id username').lean()
        if (!user) return res.status(404).json({ success: false, message: "User not found" })


        const tradeDoc = await Trade.findById(tradeId)
            .populate('profileId', 'name profileImage')
            .lean()

        if (!tradeDoc) return res.status(404).json({ success: false, message: "Trade not found" })
        const follow = await Follow.findById(tradeDoc.followId).lean()
        if (!follow || follow.userId.toString() !== userId.toString()) return res.status(403).json({ success: false, message: "Not authorized to view this trade" })

        let currentPrice = await getCurrentPrice(tradeDoc.symbol)
        if (!currentPrice) {
            console.log(`No currentPrice for ${tradeDoc.symbol} - return null`)
            currentPrice = null
        }
        const trade = {
            _id: tradeDoc._id,
            followId: tradeDoc.followId,
            symbol: tradeDoc.symbol,
            side: tradeDoc.side,
            quantity: tradeDoc.quantity,
            price: tradeDoc.price,
            currentPrice,
            status: tradeDoc.status,
            rejectionReason: tradeDoc.rejectionReason,
            exitPrice: tradeDoc.exitPrice,
            pnlAtClose: tradeDoc.pnlAtClose,
            triggerRefId: tradeDoc.triggerRefId,
            createdAt: tradeDoc.createdAt,
            updatedAt: tradeDoc.updatedAt,
            profile: {
                _id: tradeDoc.profileId._id,
                name: tradeDoc.profileId.name,
                profileImage: tradeDoc.profileId.profileImage,
            }


        }
        return res.json({ success: true, user, trade })
    } catch (error) {
        console.log("Error fetching trade by id: ", error)
        return res.status(500).json({ success: false, message: error.message || "Internal server error" })
    }
}
const getPositionById = async (req, res, next) => {
    try {
        const posId = req.params.id;
        const userId = req.user._id;

        if (!posId) return res.status(400).json({ success: false, message: "Position id is required" })

        const user = await User.findOne({ _id: userId }).select('_id username').lean()
        const systemUser = await User.findOne({ systemUser: true }).select('_id username').lean()
        if (!user) return res.status(404).json({ success: false, message: "User not found" })



        const pos = await Position.findById({ _id: posId })
            .populate({
                path: 'followId',
                select: 'profileId',
                populate: { path: 'profileId', select: 'name profileImage' }
            })
            .lean()
        if (!pos) return res.status(404).json({ success: false, message: "Position not found" })

        const follows = await Follow.find({ profileId: pos.followId?.profileId }).lean()
        if (follows.length === 0) return res.status(404).json({ success: false, message: "Follow not found" })
        const filteredFollow = systemUser ? follows.filter(f => f.userId?.toString() !== systemUser?._id?.toString()) : follows
        const previousClose = await getYesterdayPrice(pos.symbol)
        if (!previousClose) console.log(`No previous close for ${pos.symbol}`)

        const livePrice = (await getCurrentPrice(pos.symbol)) || pos.currentPrice || pos.avgPrice || 0
        const quantity = Number(pos.quantity) || 0
        const avgPrice = Number(pos.avgPrice) || 0
        const todaysChangeAmount = ((livePrice - previousClose) * quantity).toFixed(2)
        const todaysChangePercent = previousClose > 0 ?  ((livePrice - previousClose) / previousClose * 100).toFixed(2) : 0

        const unrealizedPnl = (livePrice - avgPrice) * quantity

        const position = {
            _id: pos._id,
            symbol: pos.symbol,
            quantity: quantity,
            avgPrice: avgPrice,
            currentPrice: livePrice,
            previousClose,
            todaysChangeAmount,
            todaysChangePercent,
            unrealizedPnl: unrealizedPnl.toFixed(2),
            createdAt: pos.createdAt,
            updatedAt: pos.updatedAt,
            follow: {
                _id: pos.followId._id,
            },
            profile: {
                _id: pos.followId?.profileId?._id,
                name: pos.followId?.profileId?.name,
                profileImage: pos.followId?.profileId?.profileImage,

                followCount: filteredFollow.length
            }
        }

        return res.json({ success: true, user, position })
    } catch (error) {
        console.log(`Error fetching position by id: `, error)
        return res.status(500).json({ success: false, message: error.message || "Internal server error" })
    }
}
const userController = {
    checkUsername,
    getPortfolioSummary,
    getUserReturns,
    getUpdatedUser,
    getHomeSummary,
    getTrades,
    getTradeById,
    getPositionById
}

export default userController;