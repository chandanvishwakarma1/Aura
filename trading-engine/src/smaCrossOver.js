import { connectDB, closeDB } from "./db.js";
import Profile from './models/Profile.js'
// import Follow from './models/Follow.js'
// import simulateTrade from './simulateTrade.js'
import getHistoricalCloses from './getHistoricalCloses.js'
import QueuedIntent from "./models/QueuedIntent.js";

const average = (prices) => {
    let sum = 0;
    for (let i = 0; i < prices.length; i++) {
        sum += prices[i];
    }
    return sum / prices.length;
}

const evaluateSmaCrossOver = (closes, shortWindow, longWindow) => {
    if (closes.length < longWindow + 1) {
        return "INSUFFICIENT_DATA";
    }
    const todayShort = average(closes.slice(-shortWindow));
    const todayLong = average(closes.slice(-longWindow));
    const yesterdayShort = average(closes.slice(-shortWindow - 1, -1));
    const yesterdayLong = average(closes.slice(-longWindow - 1, -1));

    // console.log(todayShort)
    // console.log(todayLong)
    // console.log(yesterdayShort)
    // console.log(yesterdayLong)

    if (yesterdayShort <= yesterdayLong && todayShort > todayLong) {
        return "BUY";
    } else if (yesterdayShort >= yesterdayLong && todayShort < todayLong) {
        return "SELL";
    } else {
        return "HOLD";
    }
}
const forced = () => {
    // Forces a BUY signal: gentle decline for ~40 days, then a sharp rally in the last ~10 days
    const forcedCrossoverCloses = [];
    let price = 300;

    // Days 1-40: gentle decline
    for (let i = 0; i < 40; i++) {
        price -= 1.2;
        forcedCrossoverCloses.push(parseFloat(price.toFixed(2)));
    }

    // Days 41-55: sharp rally — this is what drags the 20-day average up fast
    for (let i = 0; i < 11; i++) {
        price += 8;
        forcedCrossoverCloses.push(parseFloat(price.toFixed(2)));
    }

    return forcedCrossoverCloses;
}
forced()
const smaEngine = async () => {
    try {
        await connectDB();
        const profiles = await Profile.find({ type: "sma_crossover" })
        if (profiles.length === 0) {
            console.log("No crossover profile found in DB.")
        }

        for (const profile of profiles) {
            for (const instrumentScope of profile.instrumentScope) {
                const symbol = instrumentScope
                const closes = await getHistoricalCloses(symbol)
                // const closes = await forced();
                if (!closes || closes.length === 0) {
                    console.log(`No closing prices for ${symbol}, skipping`);
                    continue;
                }
                console.log(`${symbol}: got ${closes.length} closing prices`);

                const side = evaluateSmaCrossOver(closes, profile.params.shortWindow, profile.params.longWindow)
                if (side === 'HOLD' || side === 'INSUFFICIENT_DATA') {
                    console.log(`No action for ${symbol} - ${side}`);
                    continue;
                };

                await QueuedIntent.create({
                    symbol,
                    side,
                    status: "pending",
                    profileId: profile._id
                })
                console.log(`Queued ${side} intent for ${symbol} for tommorrow`)

            }
        }

        await closeDB();
    } catch (error) {
        console.log("Error in smaEngine: ", error);
        await closeDB();
    }
}
smaEngine()