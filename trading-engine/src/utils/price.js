import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ['ripHistorical', 'yahooSurvey']});

const getCurrentPrice = async(symbol) => {
    const Symbol = symbol + '.NS'
    try {
        const liveSnapshot = await yahooFinance.quote(Symbol);
        // console.log(liveSnapshot.regularMarketPrice)
        return liveSnapshot.regularMarketPrice;
        } catch (error) {
        console.error(error);
    }
}
export default getCurrentPrice;
