import Follow from '../models/Follow.js';
import Profile from '../models/Profile.js'
import Trade from '../models/Trade.js';
import User from '../models/User.js'
import EquitySnapshot from "../models/EquitySnapshot.js"
import mongoose from 'mongoose';
const getProfiles = async (req, res, next) => {
    try {
        const { filter } = req.query;
        const allProfiles = await Profile.find().lean();
        const allFollows = await Follow.find().lean()
        const system = await User.findOne({ systemUser: true }).select('_id')
        const systemId = system ? system._id.toString() : null

        // const followProfileIds = allFollows.map(f => f.profileId)

        const followCountMap = {}
        for (const follow of allFollows) {
            const profileIdStr = follow.profileId.toString()
            if (systemId && follow.userId.toString() === systemId) continue
            followCountMap[profileIdStr] = (followCountMap[profileIdStr] || 0) + 1;
        }
        // console.log(followCountMap)
        const winRateAgg = await Trade.aggregate([
            { $match: { status: "closed" } },
            {
                $group: {
                    _id: "$profileId",
                    total: { $sum: 1 },
                    wins: { $sum: { $cond: [{ $gt: ["$pnlAtClose", 0] }, 1, 0] } }
                }
            },
            {
                $project: {
                    profileId: "$_id",
                    winRate: { $multiply: [{ $divide: ["$wins", "$total"] }, 100] },
                    wins: "$wins",
                    total: "$total"
                }
            }
        ])

        const winRateMap = {}
        for (const item of winRateAgg) {
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

const RANGE_DAYS = {
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
    'ALL': null //all
}

const getProfileReturns = async (req, res, next) => {
    try {
        const { id: profileId } = req.params
        const range = (req.query.range || '1M').toUpperCase()

        if (!(range in RANGE_DAYS)) {
            return res.status(400).json({ success: false, message: 'Invalid range. Use 1W, 1M, 3M, 6M, 1Y, ALL' })
        }

        const rangeDays = RANGE_DAYS[range]
        let queryFilter = { profileId }
        let requestedStart = null

        if (rangeDays !== null) {
            requestedStart = new Date()
            requestedStart.setDate(requestedStart.getDate() - rangeDays)
            queryFilter.date = { $gte: requestedStart }
        }
        //oldest
        let windowSnapshot = await EquitySnapshot.find(queryFilter).sort({ date: 1 }).lean()

        let hasFullHistory = true;
        if (windowSnapshot.length === 0 && rangeDays !== null) {
            windowSnapshot = await EquitySnapshot.find({ profileId }).sort({ date: 1 }).lean()
            hasFullHistory = false;
        } else if (rangeDays !== null && windowSnapshot.length > 0) {
            hasFullHistory = windowSnapshot[0].date <= new Date(requestedStart.getTime() + 86400000)
        }

        if (windowSnapshot.length === 0) {
            return res.json({ success: true, range, data: [], hasFullHistory: false })
        }
        //rebase: %return since start of window not profile inception
        const baseMultiplier = windowSnapshot[0].cumulativeMultiplier
        const rebased = windowSnapshot.map(s => ({
            date: s.date,
            value: Math.round(((s.cumulativeMultiplier / baseMultiplier) - 1) * 10000) / 100 //% to 2decimal
        }))


        return res.json({ success: true, range, data: rebased, hasFullHistory })


    } catch (error) {
        console.log("Error fetching profile returns: ", error)
        return res.status(500).json({ success: false, message: error.message || "Internal server error" })
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
        const user = await User.findOne({_id: userId})
        if(!user) return res.status(400).json({ success: false, message: "User not found" })
        const existingFollow = await Follow.findOne({ userId, profileId })
        if (existingFollow) return res.status(400).json({ success: false, message: "Profile already followed" })

        if(capitalAllocated < user.availableCapital) return res.status(400).json({ success: false, message: "Insufficient funds" }  )
        user.availableCapital -= capitalAllocated
        await user.save()

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

const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate ObjectId format upfront to prevent CastError crashes
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid profile ID format" });
    }

    // 2. Fetch profile using .lean() for a plain JS object
    const profile = await Profile.findById(id).lean();
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    const profileObjectId = new mongoose.Types.ObjectId(id);

    // 3. Run queries in parallel for better performance
    const [systemUser, winRateAgg] = await Promise.all([
      User.findOne({ systemUser: true }).select('_id').lean(),
      Trade.aggregate([
        { $match: { profileId: profileObjectId, status: "closed" } },
        {
          $group: {
            _id: "$profileId",
            total: { $sum: 1 },
            wins: { $sum: { $cond: [{ $gt: ["$pnlAtClose", 0] }, 1, 0] } }
          }
        },
        {
          $project: {
            winRate: {
              $cond: [
                { $eq: ["$total", 0] },
                0,
                { $multiply: [{ $divide: ["$wins", "$total"] }, 100] }
              ]
            }
          }
        }
      ])
    ]);

    // Build follow query filtering out system user if present
    const followQuery = { profileId: profileObjectId };
    if (systemUser) {
      followQuery.userId = { $ne: systemUser._id };
    }

    const followCount = await Follow.countDocuments(followQuery);
    const winRate = winRateAgg.length > 0 ? winRateAgg[0].winRate : 0;

    // 4. Construct clean response payload
    const profileWithCounts = {
      ...profile,
      followCount,
      winRate: Number(winRate.toFixed(2))
    };

    return res.json({ success: true, profile: profileWithCounts });

  } catch (error) {
    console.error("Error fetching profile by id: ", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

const profileController = {
    getProfiles,
    postFollow,
    getFollows,
    getTrades,
    getProfileReturns,
    getProfileById
}
export default profileController