import { connectDB } from "./db.js"
import Follow from "./models/Follow.js"
import Profile from "./models/Profile.js"
import Disclosure from "./models/Disclosure.js"
import Position from "./models/Position.js"
import { closeDB } from "./db.js"
import QueuedIntent from "./models/QueuedIntent.js"
import marketStatus from "./marketStatus.js"
import processIntent from "./processIntent.js"


const insiderEngine = async () => {
    try {
        await connectDB()
        const profiles = await Profile.find({ type: "insider_mirror" })
        if (profiles.length === 0) {
            console.log("No insider mirror profile found in DB.")
            return;
        }
        const unprocessedDisclosure = await Disclosure.find({ processed: false, isCorporateEntity: false })

        if (unprocessedDisclosure.length === 0) {
            console.log(`No disclosure processing pending - terminating pipeline`)
            return
        }
        const isMarketOpen = marketStatus()
        // const isMarketOpen = true;
        console.log(isMarketOpen)
        const orderType = isMarketOpen?'Market' : 'AMO'
        const finishedIds = []
        for (const profile of profiles) {
            const follows = await Follow.find({profileId: profile._id})
            const followerIds = follows.map(f=>f._id)
            if(followerIds.length === 0){
                console.log(`No followers for ${profile._id} - skip`)
                continue
            }


            for (const disclosure of unprocessedDisclosure) {
                const value = (disclosure.quantity || 0) * (disclosure.price || 0)
                if (value > 100000000) {
                    console.log(`Value ₹${value.toLocaleString('en-IN')} is greater than 10 crores handing over to Whale.`)
                    continue;
                } 
                const symbol = disclosure.symbol
                const side = disclosure.transactionType
                if(side === 'Sell'){
                    const existingPosition = await Position.countDocuments({followId: {$in: followerIds}, symbol})
                    if(existingPosition===0){
                        console.log(`Dropping Sell signal for ${symbol} - no active positions across any of this profiles user`)
                        continue
                    }
                }
                const intent = await QueuedIntent.create({
                    symbol,
                    side,
                    status:"pending",
                    profileId:profile._id,
                    decisionPrice: disclosure.price,
                    orderType
                })
                if(isMarketOpen){
                    await processIntent(intent)
                    await QueuedIntent.findByIdAndUpdate(intent._id, {$set: {status: "executed"}})
                } else {
                    console.log(`Queued ${side} intent for ${symbol} for tommorrow`)
                }
                finishedIds.push(disclosure._id)
            }
        }
        if(finishedIds.length > 0){
            const uniqueIds = [...new Set(finishedIds)]
        await Disclosure.updateMany({_id: {$in: uniqueIds}},{$set: {processed: true}})
        console.log(`Succesfully completed batch run execution updates for ${uniqueIds.length} disclosures`)}
    } catch (error) {
        console.log('Error in insiderEngine: ', error)
    } finally {
        await closeDB()
    }
}
insiderEngine()