import Follow from "../models/Follow.js"
import Trade from "../models/Trade.js"
import { fetchBatchMarketPrices} from '../lib/price.js'
import Position from '../models/Position.js'

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
        totalEquity += follow.capitalAllocated + realizedPnl + unrealizedPnl
        totalCapitalAllocated += follow.capitalAllocated

    }
    return { totalEquity, totalCapitalAllocated , followCount: follows.length}
}
export default computeUserEquity