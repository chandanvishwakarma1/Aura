import Follow from '../models/Follow.js';
import Profile from '../models/Profile.js'
import Trade from '../models/Trade.js';
import User from '../models/User.js'
const getProfiles = async (req, res, next) => {
    try {
        const { filter } = req.query;
        const allProfiles = await Profile.find().lean();
        const allFollows = await Follow.find().lean()
        const system = await User.findOne({systemUser:true}).select('_id')
        const systemId = system? system._id.toString() : null

        // const followProfileIds = allFollows.map(f => f.profileId)

        const followCountMap = {}
        for (const follow of allFollows) {
            const profileIdStr = follow.profileId.toString()
            if(systemId && follow.userId.toString() === systemId) continue
            followCountMap[profileIdStr] = (followCountMap[profileIdStr] || 0) + 1;
        }
        // console.log(followCountMap)
            const winRateAgg = await Trade.aggregate([
                {$match: { status: "closed"}},
                {$group: {
                    _id: "$profileId",
                    total: { $sum: 1},
                    wins: { $sum: { $cond: [{ $gt: ["$pnlAtClose", 0]}, 1 ,0]}}
                }},
                {$project: {
                    profileId: "$_id",
                    winRate: { $multiply: [{ $divide: ["$wins", "$total"]}, 100]},
                    wins: "$wins",
                    total: "$total"
                }}
            ])

            const winRateMap = {}
            for(const item of winRateAgg){
                const profileIdStr = item.profileId.toString()
                winRateMap[profileIdStr] = item.winRate;
            }
        
        
        const profileWithCounts = allProfiles.map(profile => {
            const profileIdStr = profile._id.toString()
            return {
                ...profile,
                followCount: followCountMap[profileIdStr] || 0,
                winRate: winRateMap[profileIdStr] !== undefined ? winRateMap[profileIdStr] : null
            }

        })

        if (filter === 'active') {
            const filteredProfiles = profileWithCounts.filter(profile => profile.active === true)
            return res.json(filteredProfiles)
        }
        return res.json(profileWithCounts)
    } catch (error) {
        console.log("Error fetching all profiles: ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}
const postFollow = async (req, res, next) => {
    try {
        const { capitalAllocated, risk, slippage } = req.body;
        const profileId = req.params.id;

        if (!profileId || !capitalAllocated || !risk || !slippage) return res.status(400).json({ message: "All fields are required" })

        const positiveNumRegex = /^\d+(\.\d+)?$/;
        const floatNumRegex = /^(0(\.\d+)?|1(\.0+)?)$/;



        if (!positiveNumRegex.test(String(capitalAllocated))) return res.status(400).json({ message: "Capital allocated should be a number" })
        if (!floatNumRegex.test(String(risk))) return res.status(400).json({ message: "Risk should be a between 0 and 1" })
        if (!floatNumRegex.test(String(slippage))) return res.status(400).json({ message: "Slippage should be a between 0 and 1" })
        const userId = req.user._id
        const existingFollow = await Follow.findOne({ userId, profileId })
        if (existingFollow) return res.status(400).json({ success: false, message: "Profile already followed" })

        const follow = new Follow({
            userId,
            profileId,
            capitalAllocated,
            risk,
            slippage
        })
        await follow.save()

        return res.json({ success: true, message: "Profile followed successfully", follow })
    } catch (error) {
        console.log("Error following profile: ", error)
        return res.status(500).json({ success: false, message: error.message || "Internal server error" })
    }
}
const getFollows = async (req, res, next) => {
    try {
        const userId = req.user._id
        const allFollows = await Follow.find({ userId })
        if (allFollows.length === 0) return res.status(400).json({ success: false, message: "No follows found" })

        return res.json({ success: true, allFollows })
    } catch (error) {
        console.log("Error fetching follows: ", error)
        return res.status(500).json({ success: false, message: error.message || "Internal server error" })
    }
}
const getTrades = async (req, res, next) => {
    try {
        const userId = req.user._id
        const follows = await Follow.find({ userId })
        if (follows.length === 0) return res.status(400).json({ success: false, message: "No follows found" })
        const followIds = follows.map(f => f._id)
        const trades = await Trade.find({ followId: { $in: followIds } })
        if (trades.length === 0) return res.status(400).json({ success: false, message: "No trades found" })
        return res.json({ success: true, trades })
    } catch (error) {
        console.log("Error fetching trades: ", error)
        return res.status(500).json({ success: false, message: error.message || "Internal server error" })
    }
}
const profileController = {
    getProfiles,
    postFollow,
    getFollows,
    getTrades
}
export default profileController