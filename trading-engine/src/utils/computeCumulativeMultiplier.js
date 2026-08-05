import Position from '../models/Position.js'
import Trade from '../models/Trade.js'
import { fetchBatchMarketPrices } from '../utils/price.js';


const computeCumulativeMultiplier = async (followId, capitalAllocated) => {
    try {
        const realizedResult = await Trade.aggregate([
            { $match: { followId: followId, status: 'closed' } },
            { $group: { _id: null, totalRealizedPnl: { $sum: '$pnlAtClose' } } }
        ])
        const realizedPnl = realizedResult.length > 0 ? realizedResult[0].totalRealizedPnl : 0;


        const openPositions = await Position.find({ followId: followId }).lean()

        let unrealizedPnl = 0
        if (openPositions.length > 0) {
            const uniqueSymbols = [...new Set(openPositions.map(p => p.symbol))]

            const liveprices = await fetchBatchMarketPrices(uniqueSymbols)

            for (const position of openPositions) {
                const currentPrice = liveprices[position.symbol].regularMarketPrice

                if (!currentPrice) {
                    console.log(`Missing price data for ${position.symbol}. Calculation may be skewed`)
                    continue
                }

                const positionPnl = (currentPrice - position.avgPrice) * position.quantity
                unrealizedPnl += positionPnl
            }
        }
        const todaysTotalValue = capitalAllocated + realizedPnl + unrealizedPnl
        const cumulativeMultiplier = todaysTotalValue / capitalAllocated

        return Number(cumulativeMultiplier.toFixed(4))

    } catch (error) {
        console.log("Error in computing cumulativeMultiplier: ", error)
    }
}
export default computeCumulativeMultiplier