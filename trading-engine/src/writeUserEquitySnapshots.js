import { closeDB, connectDB } from './utils/db.js'
import User from './models/User.js'
import Follow from './models/Follow.js'
import UserEquitySnapshot from './models/UserEquitySnapshots.js'
import 'dotenv/config'
import Trade from './models/Trade.js'
import Position from './models/Position.js'
import { fetchBatchMarketPrices } from './utils/price.js'

const computeUserEquity = async (userId) => {
    const follows = await Follow.find({ userId }).lean()

    if (follows.length === 0) return null

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
            }
        }

        const followValue = follow.capitalAllocated + realizedPnl + unrealizedPnl
        totalEquity += followValue
        totalCapitalAllocated += follow.capitalAllocated


    }



    return {
        totalEquity,
        totalCapitalAllocated,
    }


}

const writeUserEquitySnapshots = async () => {
    try {
        await connectDB()

        const realUser = await User.find({ systemUser: { $ne: true } }).select('_id').lean()
        if (realUser.length === 0) {
            console.log(`No real user found - cannot write snapshots`)
            return
        }
        console.log(`Found ${realUser.length} real users`)


        const today = new Date()
        today.setUTCHours(0, 0, 0, 0)

        for (const user of realUser) {
            try {
                const result = await computeUserEquity(user._id)
                if (!result) {
                    console.log(`No follows for user  [${user._id}] - skipping`)
                    continue
                }

                const { totalEquity, totalCapitalAllocated } = result
                const totalReturnPercent = totalCapitalAllocated > 0
                    ? Number((((totalEquity - totalCapitalAllocated) / totalCapitalAllocated) * 100).toFixed(2))
                    : 0

                await UserEquitySnapshot.updateOne(
                    { userId: user._id, date: today },
                    {
                        $set: {
                            totalEquity,
                            totalCapitalAllocated,
                            totalReturnPercent
                        }
                    },
                    { upsert: true }
                )
                console.log(`Updated equity snapshot for user [${user._id}]: equity: ${totalEquity}, Return: ${totalReturnPercent}%`)
            } catch (userErr) {
                console.log(`Failed processing profile  [${user._id}]: `, userErr)
            }
        }
    } catch (error) {
        console.log(`Error in writeEquitySnapshots: `, error)
    } finally {
        await closeDB()
    }
}
writeUserEquitySnapshots()