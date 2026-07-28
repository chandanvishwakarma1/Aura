import 'dotenv/config'
import YahooFinance from 'yahoo-finance2'
const getHistoricalCloses = async (symbol, days = 80) => {
    const yahooFinance = new YahooFinance({ suppressNotices: ['ripHistorical', 'yahooSurvey']});
    const Symbol = symbol + '.NS'
    const now = new Date();
    const past = new Date(now);
    past.setDate(past.getDate() - days);
    const queryOptions = {
        period1: past.toISOString().split('T')[0],
        period2: now.toISOString().split('T')[0],
        interval: '1d'
    }
    try {
        const data = await yahooFinance.historical(Symbol, queryOptions);
        const closes = [];
        for (const d of data) {
            closes.push(d.close)
        }
        const liveSnapshot = await yahooFinance.quote(Symbol);
        closes.push(liveSnapshot.regularMarketPrice)
        return closes
    } catch (error) {
        console.log("Failed to fetch historical data:", error)
    }
}
export default getHistoricalCloses;