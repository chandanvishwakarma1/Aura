import {connectDB, closeDB} from './utils/db.js'
import Profile from './models/Profile.js'

const PROFILES = [
  {
    name: "The Insider",
    shortIntro: 'Mirrors public NSE filings',
    description: "Mirrors public disclosures of company insiders (promoters/directors) buying or selling their own company's shares.",
    type: "insider_mirror",
    params: {},
    instrumentScope: "all",
    active: true,
  },
  {
    name: "The Whale",
    shortIntro: 'Copies large disclosed trades',
    description: "Mirrors large single-day bulk and block deals disclosed by big investors.",
    type: "bulk_mirror",
    params: {},
    instrumentScope: "all",
    active: true,
  },
  {
    name: "The Technician",
    shortIntro: 'Trades on moving average crossovers',
    description: "Buys when a stock's 20-day average price crosses above its 50-day average (trend-following); sells on the reverse cross.",
    type: "sma_crossover",
    params: { shortWindow: 20, longWindow: 50 },
    instrumentScope: ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK"], // starter universe, expand as you like
    active: true,
  },
  {
    name: "The Momentum Chaser",
    shortIntro: 'Buys stocks breaking new highs',
    description: "Buys when a stock breaks above its recent 20-day high price.",
    type: "breakout",
    params: { lookback: 20 },
    instrumentScope: ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK"],
    active: true,
  }
]
const main = async() =>{
  await connectDB();
  const profiles = await Profile.find()

  for(const profileData of profiles){
    const profileImage=`https://api.dicebear.com/10.x/glass/png?&animationVariant=fast:1&seed=${profileData._id}`
    await Profile.findByIdAndUpdate( profileData._id, {$set: {profileImage: profileImage}})

  }
  await closeDB();
}
main()