import Position from "./models/Position.js"
import Trade from "./models/Trade.js";
import getCurrentPrice from "./utils/price.js";

const simulateTrade = async (follow, symbol, side, risk, fillPrice, intentId, quantity) => {
    let tradeExecuted = false;
    const existingPosition = await Position.findOne({ followId: follow._id, symbol });
    if (existingPosition && side == "Buy") {
        console.log(`Ignoring buy signal - position already exists for ${symbol}`)
        return tradeExecuted;
    }
    if (!existingPosition && side == "Sell") {
        console.log(`Ignoring sell signal - no active postion for ${symbol}`)
        return tradeExecuted;
    }

    const currentPrice = fillPrice || await getCurrentPrice(symbol);

    console.log("=== SIMULATE TRADE INPUT DEBUG ===");
    console.log("follow object:", JSON.stringify(follow, null, 2));
    console.log("risk value:", risk);
    console.log("currentPrice value:", currentPrice);
    console.log("==================================");

    if (side == "Buy") {
        if (quantity < 1) {
            console.log(`Allocation too small to buy 1 share of ${symbol} at ${currentPrice}`)

            return tradeExecuted;
        }
        await Trade.create({
            symbol,
            followId: follow._id,
            profileId: follow.profileId,
            side: "Buy",
            status: "open",
            quantity,
            price: currentPrice,
            triggerRefId: intentId
        })

        await Position.create({
            followId: follow._id,
            symbol,
            quantity,
            currentPrice,
            avgPrice: currentPrice
        })
        tradeExecuted = true;
    } else if (side == "Sell") {
        // const position = await Position.findOne({ followId: follow._id, symbol})
        const pnlAtClose = (currentPrice - existingPosition.avgPrice) * quantity;
        await Trade.updateOne({ followId: follow._id, symbol, status: "open" }, { $set: { status: "closed", pnlAtClose, exitPrice: currentPrice } })

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

    return tradeExecuted;
}

export default simulateTrade;