import { closeDB, connectDB } from './utils/db.js'
import User from './models/User.js'
import Profile from './models/Profile.js'
import Follow from './models/Follow.js'
import EquitySnapshot from './models/EquitySnapshot.js'
import computeCumulativeMultiplier from './utils/computeCumulativeMultiplier.js'
import 'dotenv/config'


const writeEquitySnapshots = async() => {
    try {
        await connectDB()

        const systemUser = await User.findOne({systemUser:true}).select('_id')
        if(!systemUser){
            console.log(`No system user found - cannot write snapshots`)
            return
        }

        const profiles = await Profile.find({active:true}).lean()
        console.log(`Found ${profiles.length} active profiles`)

        const today = new Date()
        today.setUTCHours(0,0,0,0)

        for(const profile of profiles){
            try {
                const systemFollow = await Follow.findOne({userId: systemUser._id, profileId: profile._id})

            if(!systemFollow){
                console.log(`No sysmtem follow for ${profile.name} - skipping`)
                continue
            }

            const cumulativeMultiplier = await computeCumulativeMultiplier(systemFollow._id, systemFollow.capitalAllocated)
            if (!cumulativeMultiplier || isNaN(cumulativeMultiplier)) {
                console.log(`Skipping snapshot for ${profile.name} - invalid cumulative multiplier`)
                continue
            }
            const cumulativeReturnPercent = Number(((cumulativeMultiplier-1)*100).toFixed(2))
            await EquitySnapshot.updateOne(
                {profileId: profile._id, date: today},
                {
                    $set: {
                        profileId: profile._id,
                        date: today,
                        cumulativeMultiplier,
                        cumulativeReturnPercent
                    }
                },
                { upsert: true }
            )
            console.log(`Updated equity snapshot for ${profile.name}: Multiplier: ${cumulativeMultiplier}, Return: ${cumulativeReturnPercent}`)
            } catch (profileErr) {
                console.log(`Failed processing profile ${profile.name}: `, profileErr)
            }
        }
    } catch (error) {
        console.log(`Error in writeEquitySnapshots: `, error)
    } finally {
        await closeDB()
    }
}
writeEquitySnapshots()