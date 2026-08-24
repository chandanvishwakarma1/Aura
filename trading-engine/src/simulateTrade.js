import Position from "./models/Position.js"
import Trade from "./models/Trade.js";
import getCurrentPrice from "./utils/price.js";
import User from './models/User.js'

const simulateTrade = async (follow, symbol, side, risk, fillPrice, intentId, quantity) => {
    let tradeExecuted = false;
    const existingPosition = await Position.findOne({ followId: follow._id, symbol });
    if (existingPosition && side === "Buy") {
        console.log(`Ignoring buy signal - position already exists for ${symbol}`)
        return tradeExecuted;
    }
    if (!existingPosition && side === "Sell") {
        console.log(`Ignoring sell signal - no active postion for ${symbol}`)
        return tradeExecuted;
    }

    const currentPrice = fillPrice || await getCurrentPrice(symbol);
    if (!currentPrice || isNaN(currentPrice)) {
        console.log(`Skipping trade for ${symbol} - no valid price available.`)
        return tradeExecuted
    }

    // console.log("=== SIMULATE TRADE INPUT DEBUG ===");
    // console.log("follow object:", JSON.stringify(follow, null, 2));
    // console.log("risk value:", risk);
    // console.log("currentPrice value:", currentPrice);
    // console.log("==================================");
    let tradeId = null

    if (side == "Buy") {
        if (quantity < 1) {
            console.log(`Allocation too small to buy 1 share of ${symbol} at ${currentPrice}`)

            return tradeExecuted;
        }
        const newTrade = await Trade.create({
            symbol,
            followId: follow._id,
            profileId: follow.profileId,
            side: "Buy",
            status: "open",
            quantity,
            price: currentPrice,
            triggerRefId: intentId
        })
        tradeId = newTrade._id

        await Position.create({
            followId: follow._id,
            symbol,
            side,
            quantity,
            currentPrice,
            avgPrice: currentPrice
        })
        tradeExecuted = true;
    } else if (side == "Sell") {
        // const position = await Position.findOne({ followId: follow._id, symbol})
        const pnlAtClose = (currentPrice - existingPosition.avgPrice) * quantity;
        // const balance = 
        const closedDate = new Date()
        const updatedTrade = await Trade.updateOne(
            { followId: follow._id, symbol, status: "open" },
            { $set: { status: "closed", pnlAtClose, exitPrice: currentPrice, closedAt: closedDate } },
            { new : true}
        ).sort({ createdAt: -1 })
        tradeId = updatedTrade ? updatedTrade._id : null
        await User.updateOne(
            { _id: follow.userId },
            { $inc: { availableCapital: pnlAtClose } }
        )

        // await Trade.create({
        //     symbol,
        //     followId: follow._id,
        //     profileId: follow.profileId,
        //     side: "SELL",
        //     status: "closed",
        //     quantity,
        //     price: currentPrice,
        //     triggerRefId: intentId
        // })
        await Position.deleteOne({ followId: follow._id, symbol })
        tradeExecuted = true;
    }
    if(tradeExecuted && follow.userId){
        // Fire the notification as an awaited background task so it is not lost
        // if the process exits, but never block trade execution on it.
        const notifyPayload = {
            userId: follow.userId,
            tradeId: tradeId ? tradeId.toString() : '',
            symbol,
            side,
            quantity,
            price: currentPrice,
            pnl: side === 'Sell' ? Number(pnlAtClose).toFixed(2) : undefined,
            status: side === 'Buy' ? "placed" : "closed"
        }
        const notifyPromise = fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/notify/trade`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'x-internal-key': process.env.INTERNAL_KEY || ''
            },
            body: JSON.stringify(notifyPayload)
        })
            .then(res => res.ok
                ? console.log(`Trade notification triggered for ${follow.userId} on ${symbol}.`)
                : console.log(`Notify endpoint responded with status ${res.status} for ${symbol}.`)
            )
            .catch(error => console.log('Failed to trigger trade notification: ', error))

        // Keep the reference allowed to run in background; handle any rejection.
        void notifyPromise
    }
    return tradeExecuted;
}

export default simulateTrade;