import QueuedIntent from "./models/QueuedIntent.js"
import Follow from "./models/Follow.js"
import { connectDB, closeDB } from './db.js'
import getCurrentPrice from "./price.js"
import simulateTrade from "./simulateTrade.js"
import Trade from './models/Trade.js'
import Position from "./models/Position.js"
import processIntent from "./processIntent.js"
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
            await processIntent(intent)
            await QueuedIntent.findByIdAndUpdate(intent._id, { $set: { status: "executed" } })
        }
    } catch (error) {
        console.log("Error in processQueuedTrades: ", error)
    } finally{
        await closeDB()
    }
}
processQueuedTrades()