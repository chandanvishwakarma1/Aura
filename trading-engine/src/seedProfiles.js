import {connectDB, closeDB} from './db.js'
import Profile from './models/Profile.js'

const PROFILES = [
  {
    name: "The Insider",
    description: "Mirrors public disclosures of company insiders (promoters/directors) buying or selling their own company's shares.",
    type: "insider_mirror",
    params: {},
    instrumentScope: "all",
    active: true,
  },
  {
    name: "The Whale",
    description: "Mirrors large single-day bulk and block deals disclosed by big investors.",
    type: "bulk_mirror",
    params: {},
    instrumentScope: "all",
    active: true,
  },
  {
    name: "The Technician",
    description: "Buys when a stock's 20-day average price crosses above its 50-day average (trend-following); sells on the reverse cross.",
    type: "sma_crossover",
    params: { shortWindow: 20, longWindow: 50 },
    instrumentScope: ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK"], // starter universe, expand as you like
    active: true,
  },
  {
    name: "The Momentum Chaser",
    description: "Buys when a stock breaks above its recent 20-day high price.",
    type: "breakout",
    params: { lookback: 20 },
    instrumentScope: ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK"],
    active: true,
  }
]
const main = async() =>{
  await connectDB();
  for(const profileData of PROFILES){
    const existing = await Profile.findOne({name: profileData.name});
    if(existing){
      console.log(`Skipping ${profileData.name} - already exists`);
      continue;
    }
    
    await Profile.create(profileData);
    console.log(`Created "${profileData.name}"`)
  }
  await closeDB();
}
main()