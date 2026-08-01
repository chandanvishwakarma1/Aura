import { closeDB, connectDB } from "./db.js";
import { getHistoricalClosePrices } from "./utils/getHistoricalCloses.js";
import Follow from "./models/Follow.js";
import Profile from "./models/Profile.js";
import Position from "./models/Position.js";
import QueuedIntent from "./models/QueuedIntent.js";
import getCurrentPrice from "./utils/price.js";

// const closes = [
//     720, 725, 718, 730, 728,
//     735, 742, 738, 745, 750,
//     748, 755, 762, 758, 765,
//     770, 768, 775, 782, 778,
//     785, 792, 788, 795, 800
// ];//(we get this from getHistoricalClosePrices)
// const currentPrice = 829 //(we get this from getCurrentPrice )
// const lookback = 20;
const evaluateBreakOut = (closes, currentPrice, lookback) => {
    if (closes.length < lookback + 1) {
        return 'INSUFFICIENT_DATA'
    }
    const historicalMax = Math.max(...closes.slice(-lookback))
    const historicalMin = Math.min(...closes.slice(-lookback))
    if (currentPrice > historicalMax) {
        return "Buy"
    } else if (currentPrice < historicalMin) {
        return "Sell"
    } else {
        return "Hold"
    }
}

// console.log(evaluateBreakOut(closes, currentPrice, lookback))

const momentumEngine = async () => {
    try {
        await connectDB()
        const profiles = await Profile.find({ type: "breakout" })
        if (profiles.length === 0) {
            console.log("No breakout profile found in DB.")
            return;
        }

        for (const profile of profiles) {
            const follows = await Follow.find({ profileId: profile._id })
            const followerIds = follows.map(f => f._id)

            for (const instrumentScope of profile.instrumentScope) {
                const symbol = instrumentScope
                const currentPrice = await getCurrentPrice(symbol)
                const closes = await getHistoricalClosePrices(symbol)
                if (!closes || closes.length === 0) {
                    console.log(`No closing prices for ${symbol}, skipping`)
                    continue;
                }
                console.log(`${symbol}: got ${closes.length} closing prices`)

                const side = evaluateBreakOut(closes, currentPrice, profile.params.lookback)
                if (side === "HOLD" || side === "INSUFFICIENT_DATA") {
                    console.log(`No action for ${symbol} - ${side}`)
                    continue;
                }
                if (side === "Sell") {
                    const existingPosition = await Position.findOne({ followId: { $in: followerIds }, symbol })
                    if (!existingPosition) {
                        console.log(`Dropping SELL signal for ${symbol} - no active positions`)
                        continue;
                    }
                }

                await QueuedIntent.create({
                    symbol,
                    side,
                    status: "pending",
                    profileId: profile._id,
                    decisionPrice: currentPrice
                })
                console.log(`Queued ${side} intent for ${symbol} for tommorrow`)
            }
        }
    } catch (error) {
        console.log("Error in momentumEngine: ", error)
    } finally {
        await closeDB()
    }
}
momentumEngine()