import { connectDB } from "./utils/db.js"
import Follow from "./models/Follow.js"
import Profile from "./models/Profile.js"
import Disclosure from "./models/Disclosure.js"
import Position from "./models/Position.js"
import { closeDB } from "./utils/db.js"
import QueuedIntent from "./models/QueuedIntent.js"
import marketStatus from "./utils/marketStatus.js"
import processIntent from "./processIntent.js"
import fetchWhaleDealsData from "./utils/fetchAndSaveDeals.js"


const whaleEngine = async () => {
    try {
        await connectDB()

        console.log(`Fetching latest bulk/block deals from NSE ... `)
        await fetchWhaleDealsData()
        const profiles = await Profile.find({ type: "bulk_mirror" })
        if (profiles.length === 0) {
            console.log("No bulk/block mirror profile found in DB.")
            return;
        }
        const unprocessedDisclosure = await Disclosure.find({ processed: false, profileTarget: 'WHALE' })

        if (unprocessedDisclosure.length === 0) {
            console.log(`No deals processing pending - terminating pipeline`)
            return
        }
        const isMarketOpen = marketStatus()
        // const isMarketOpen = true;
        console.log(isMarketOpen)
        const orderType = isMarketOpen ? 'Market' : 'AMO'
        const finishedIds = []
        console.log(`Found ${unprocessedDisclosure.length} unprocessed WHALE disclosures to evaluate`)
        for (const profile of profiles) {
            const follows = await Follow.find({ profileId: profile._id })
            const followerIds = follows.map(f => f._id)
            if (followerIds.length === 0) {
                console.log(`No followers for ${profile._id} - skip`)
                continue
            }

            for (const disclosure of unprocessedDisclosure) {
                const symbol = disclosure.symbol
                const side = disclosure.transactionType

                const intent = await QueuedIntent.create({
                    symbol,
                    side,
                    status: "pending",
                    profileId: profile._id,
                    decisionPrice: disclosure.price,
                    profileDisplayTag: disclosure.profileDisplayTag,
                    systemCopyWeight: disclosure.systemCopyWeight,
                    orderType
                })
                if (isMarketOpen) {
                    await processIntent(intent)
                    await QueuedIntent.findByIdAndUpdate(intent._id, { $set: { status: "executed" } })
                } else {
                    console.log(`Queued ${side} intent for ${symbol} for tommorrow`)
                }
                finishedIds.push(disclosure._id)
            }
        }
        if (finishedIds.length > 0) {
            const uniqueIds = [...new Set(finishedIds)]
            await Disclosure.updateMany({ _id: { $in: uniqueIds } }, { $set: { processed: true } })
            console.log(`Succesfully completed batch run execution updates for ${uniqueIds.length} disclosures`)
        }
    } catch (error) {
        console.log('Error in whaleEngine: ', error)
    } finally {
        await closeDB()
    }
}
whaleEngine()
