import moment from 'moment-timezone'

const marketStatus = () => {
    const now = moment().tz('Asia/Kolkata')
    const marketStart = moment().tz('Asia/Kolkata').set({ hour: 9, minute: 15, second: 0})
    const marketEnd = moment().tz('Asia/Kolkata').set({ hour: 15, minute: 30, second: 0})

    const isWeekDay = now.day() !==0 && now.day()!==6
    const isMarketOpen = isWeekDay && now.isBetween(marketStart, marketEnd)

    if(isMarketOpen){
        // console.log("MARKET OPEN")
        return true
    } else{
        // console.log("MARKET CLOSED")
        return false
    }
}
export default marketStatus