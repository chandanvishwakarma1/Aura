import QueuedIntent from "./models/QueuedIntent.js"
import Follow from "./models/Follow.js"
import { connectDB, closeDB } from './db.js'
import  getCurrentPrice  from "./price.js"
import simulateTrade from "./simulateTrade.js"
// import { connectDB } from "./db.js"

const processQueuedTrades = async () => {
    try {
        await connectDB()
        console.log("Processing trades at market open....")
        const queuedIntent = await QueuedIntent.find({ status: "pending" })
        if (queuedIntent.length === 0) {
            console.log("No intent queue today")
            await closeDB()
            return;
        }

        for (const intent of queuedIntent) {
            const { symbol, side, profileId } = intent;
            const currentPrice = await getCurrentPrice(symbol);
            const follows = await Follow.find({ profileId });
            for (const follow of follows) {
                const risk = follow.risk;
                const tradeExecuted = await simulateTrade(follow, symbol,side,risk, currentPrice)
                if(tradeExecuted) console.log(`Trade sma ${follow._id} executed for ${symbol}`)
                else console.log(`Trade sma ${follow._id} not executed for ${symbol}`)
            }
            await QueuedIntent.findByIdAndUpdate(intent._id , { $set: { status: "executed" } })
        }
        await closeDB()
    } catch (error) {
        console.log("Error in processQueuedTrades: ", error)
    await closeDB();
    }
}
processQueuedTrades()