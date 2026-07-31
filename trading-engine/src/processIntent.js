import getCurrentPrice from "./price.js";
import Follow from "./models/Follow.js";
import Position from "./models/Position.js";
import Trade from "./models/Trade.js";
import simulateTrade from "./simulateTrade.js";

const processIntent = async (intent) => {
        const { symbol, side, profileId } = intent;
        const currentPrice = await getCurrentPrice(symbol);
        // const currentPrice = 341;
        const follows = await Follow.find({ profileId });
        if (follows.length === 0) {
            console.log(`No followers for ${profileId} - Skipping order`)
            return;
        }


        for (const follow of follows) {
            const risk = follow.risk;
            let quantity = 0;
            if (side === "Buy") {
                quantity = Math.floor(follow.capitalAllocated * risk / currentPrice)
            } else if (side === 'Sell') {
                const existingPosition = await Position.findOne({ followId: follow._id, symbol })
                if (!existingPosition) {
                    console.log(`No active position for ${symbol} by ${follow._id}`)
                    continue
                }
                quantity = existingPosition.quantity
            }
            if (quantity <= 0) continue

            if (currentPrice > (intent.decisionPrice * (1 + follow.slippage)) && side === "Buy") {
                console.log(`Skipped buying order due too much slippage.`)
                await Trade.create({
                    followId: follow._id,
                    symbol,
                    profileId,
                    side,
                    quantity,
                    price: currentPrice,
                    status: "skipped",
                    rejectionReason: "SLIPPAGE_EXCEEDED",
                    triggerRefId: intent._id
                })
                continue;
            }
            if (currentPrice < (intent.decisionPrice * (1 - follow.slippage)) && side === "Sell") {
                console.log(`Skipped selling order due too much sllipage.`)
                await Trade.create({
                    followId: follow._id,
                    symbol,
                    profileId,
                    side,
                    quantity,
                    price: currentPrice,
                    status: "skipped",
                    rejectionReason: "SLIPPAGE_EXCEEDED",
                    triggerRefId: intent._id
                })
                continue;
            }
            try {
                const tradeExecuted = await simulateTrade(follow, symbol, side, risk, currentPrice, intent._id, quantity)
                if (tradeExecuted) console.log(`Trade sma ${follow._id} executed for ${symbol}`)
                else console.log(`Trade sma ${follow._id} not executed for ${symbol}`)

            } catch (error) {
                console.log(`Execution crash protected for follower ${follow._id}: `, error)
            }
        }
    
}
export default processIntent;