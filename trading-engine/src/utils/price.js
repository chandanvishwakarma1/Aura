import YahooFinance from "yahoo-finance2";
import { getNsePrice } from "./nseSession.js";

const yahooFinance = new YahooFinance({ suppressNotices: ['ripHistorical', 'yahooSurvey']});

const getCurrentPrice = async(symbol) => {
    const Symbol = symbol + '.NS'
    try {
        const liveSnapshot = await yahooFinance.quote(Symbol);
        if(!liveSnapshot || liveSnapshot.regularMarketPrice === undefined) {
            console.warn(`Price property missing for ${symbol}. API response: `, liveSnapshot)
            return await getNsePrice(symbol);
        }
        // console.log(liveSnapshot.regularMarketPrice)
        return liveSnapshot.regularMarketPrice;
        } catch (error) {
        console.error(`Failed fetching price for ${symbol}`,error);
        return await getNsePrice(symbol);
    }
}
export default getCurrentPrice;

export const fetchBatchMarketPrices = async(symbols) => {
    const nsSymbols = symbols.map(s => s + '.NS')
    const prices = {}
    try {
        const quotes = await yahooFinance.quote(nsSymbols, {return: 'object',fields: ['symbol','regularMarketPrice']})
        for (const [fullSymbol, quote] of Object.entries(quotes)) {
            if (!quote || quote.regularMarketPrice === undefined) {
                console.warn(`Price property missing for ${fullSymbol}. API response: `, quote)
                continue
            }
            const baseSymbol = fullSymbol.replace(/\.NS$/, '')
            prices[baseSymbol] = quote.regularMarketPrice
        }
    } catch (error) {
        console.log(`Error fetch batch prices: `, error)
    }

    // Fall back to NSE for any symbols Yahoo missed
    const missingSymbols = symbols.filter(s => prices[s] === undefined)
    for (const symbol of missingSymbols) {
        const nsePrice = await getNsePrice(symbol)
        if (nsePrice !== null && nsePrice !== undefined) {
            prices[symbol] = nsePrice
        }
    }
    return prices
}
