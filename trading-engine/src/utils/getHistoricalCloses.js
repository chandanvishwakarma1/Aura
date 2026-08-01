import 'dotenv/config'
import YahooFinance from 'yahoo-finance2'

export const getHistoricalClosePrices = async(symbol, days=80) => {
    const yahooFinance = new YahooFinance({ suppressNotices: ['ripHistorical', 'yahooSurvey']});
    const Symbol = symbol + '.NS'
    const now = new Date();
    now.setDate(now.getDate() -1)
    const past = new Date(now);
    past.setDate(past.getDate() - days);
    const queryOptions = {
        period1: past.toISOString().split('T')[0],
        period2: now.toISOString().split('T')[0],
        interval: '1d',
    }
    // console.log(queryOptions.period1, queryOptions.period2)
    try {
        const data = await yahooFinance.historical(Symbol, queryOptions);
        const closes = [];
        for (const d of data) {
            if (d.close !== null) {
                closes.push(d.close)
            }
        }
        // console.log(closes)
        return closes
    } catch (error) {
        console.log("Failed to fetch historical data:", error)
        return []
    }
    
}
const getHistoricalCloses = async (symbol, days = 80) => {
    const yahooFinance = new YahooFinance({ suppressNotices: ['ripHistorical', 'yahooSurvey']});
    const Symbol = symbol + '.NS'
    try {
        const closes = await getHistoricalClosePrices(symbol)
        const liveSnapshot = await yahooFinance.quote(Symbol);
        if (liveSnapshot.regularMarketPrice !== null) {
            closes.push(liveSnapshot.regularMarketPrice)
        }
        // console.log(closes)
        return closes
    } catch (error) {
        console.log("Failed to fetch historical data:", error)
        return []
    }
}
// getHistoricalClosePrices('RELIANCE')
export default getHistoricalCloses;