import QueuedIntent from "./models/QueuedIntent.js"
import Follow from "./models/Follow.js"
import { connectDB, closeDB } from './db.js'
import getCurrentPrice from "./price.js"
import simulateTrade from "./simulateTrade.js"
import Trade from './models/Trade.js'
// import { connectDB } from "./db.js"

const processQueuedTrades = async () => {
    try {
        await connectDB()
        console.log("Processing trades at market open....")
        const queuedIntent = await QueuedIntent.find({ status: "pending" })
        if (queuedIntent.length === 0) {
            console.log("No intent queue today")
            return;
        }


        for (const intent of queuedIntent) {
            const { symbol, side, profileId } = intent;
            const currentPrice = await getCurrentPrice(symbol);
            // const currentPrice = 341;
            const follows = await Follow.find({ profileId });
            if(follows.length === 0){
                console.log(`No followers for ${profileId} - Skipping order`)
                continue;
            }


            for (const follow of follows) {
                const risk = follow.risk;

                if (currentPrice > (intent.decisionPrice * (1 + follow.slippage)) && side === "BUY") {
                    console.log(`Skipped buying order due too much slippage.`)
                    await Trade.create({
                        followId: follow._id,
                        symbol,
                        profileId,
                        side,
                        quantity: 0,
                        price: currentPrice,
                        status: "skipped",
                        rejectionReason: "SLIPPAGE_EXCEEDED",
                        triggerRefId: intent._id
                    })
                    continue;
                }
                if (currentPrice < (intent.decisionPrice * (1 - follow.slippage)) && side === "SELL") {
                    console.log(`Skipped selling order due too much sllipage.`)
                    await Trade.create({
                        followId: follow._id,
                        symbol,
                        profileId,
                        side,
                        quantity: 0,
                        price: currentPrice,
                        status: "skipped",
                        rejectionReason: "SLIPPAGE_EXCEEDED",
                        triggerRefId: intent._id
                    })
                    continue;
                }
                try {
                    const tradeExecuted = await simulateTrade(follow, symbol, side, risk, currentPrice, intent._id)
                    if (tradeExecuted) console.log(`Trade sma ${follow._id} executed for ${symbol}`)
                    else console.log(`Trade sma ${follow._id} not executed for ${symbol}`)

                } catch (error) {
                    console.log(`Execution crash protected for follower ${follow._id}: `, error)
                }
            }
            await QueuedIntent.findByIdAndUpdate(intent._id, { $set: { status: "executed" } })
        }
    } catch (error) {
        console.log("Error in processQueuedTrades: ", error)
    } finally{
        await closeDB()
    }
}
processQueuedTrades()