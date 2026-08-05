import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ['ripHistorical', 'yahooSurvey']});

const getCurrentPrice = async(symbol) => {
    const Symbol = symbol + '.NS'
    try {
        const liveSnapshot = await yahooFinance.quote(Symbol);
        // console.log(liveSnapshot.regularMarketPrice)
        return liveSnapshot.regularMarketPrice;
        } catch (error) {
        console.error(`Failed fetching price for ${symbol}`,error);
        return null
    }
}
export default getCurrentPrice;

export const fetchBatchMarketPrices = async(symbols) => {
    const nsSymbols = symbols.map(s => s + '.NS')
    try {
        const quotes = await yahooFinance.quote(nsSymbols, {return: 'object',fields: ['symbol','regularMarketPrice']})
        console.log(quotes['INFY.NS'].regularMarketPrice)
        return quotes
    } catch (error) {
        console.log(`Error fetch batch prices: `, error)
        return null
    }
}
fetchBatchMarketPrices(['RELIANCE', 'TCS', 'INFY'])