import xlsx from 'xlsx'
import * as cheerio from 'cheerio';

// The static parent page where AMFI posts all update file variants
const PARENT_LANDING_PAGE = "https://www.amfiindia.com/otherdata/categorisation-of-stocks";
const FALLBACK_STATIC_URL = "https://amfiindia.com";

/**
 * Dynamically scrapes the AMFI index page to find the newest xlsx asset URL
 */
const fetchDynamicAmfiUrl = async () => {
    try {
        const browserHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        };

        const res = await fetch(PARENT_LANDING_PAGE, { headers: browserHeaders });
        if (!res.ok) throw new Error(`Landing page status error: ${res.status}`);
        
        const html = await res.text();
        const $ = cheerio.load(html);
        
        let dynamicallyDiscoveredUrl = null;

        // Loop over every anchor link on the AMFI page to trace active excel patterns
        $('a').each((index, element) => {
            const href = $(element).attr('href');
            if (href && href.endsWith('.xlsx') && href.toLowerCase().includes('averagemarketcapitalization')) {
                dynamicallyDiscoveredUrl = href;
                return false; // Break the cheerio loop once found
            }
        });

        if (dynamicallyDiscoveredUrl) {
            // Check if AMFI used a relative URL or absolute platform path structure
            if (!dynamicallyDiscoveredUrl.startsWith('http')) {
                dynamicallyDiscoveredUrl = dynamicallyDiscoveredUrl.startsWith('/') 
                    ? `https://www.amfiindia.com${dynamicallyDiscoveredUrl}`
                    : `https://amfiindia.com${dynamicallyDiscoveredUrl}`;
            }
            console.log(`[AMFI Engine]: Discovered active dataset endpoint -> ${dynamicallyDiscoveredUrl}`);
            return dynamicallyDiscoveredUrl;
        }

        throw new Error("No active excel links matched parsing rules on landing page.");

    } catch (e) {
        console.warn(`[AMFI Engine Warning]: Scraper failed (${e.message}). Reverting to default fallback link.`);
        return FALLBACK_STATIC_URL;
    }
};
const url = await fetchDynamicAmfiUrl()
const getlookupDB = async() => {
    try {
        // Hardened Browser Archetype Spoofing
        const browserHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br', // Crucial to keep lowercase for matching browser network definitions
            'Connection': 'keep-alive',
        };
        
        const res = await fetch(url, browserHeaders)
        if(!res.ok) throw new Error (`HTTP Error! - ${res.status}`)

        const buffer = await res.arrayBuffer()

        const workBook = xlsx.read(buffer, {type: 'buffer'})
        const firstSheetName = workBook.SheetNames[0]
        const workSheet = workBook.Sheets[firstSheetName]

        const rawRows =xlsx.utils.sheet_to_json(workSheet, {header: 1})

        // console.log(rawRows)

        let headerRowIndex = -1;
        for(let i=0;i<rawRows.length; i++){
            if (rawRows[i].some(cell => {
                const str = String(cell).toUpperCase();
                return str.includes('NSE SYMBOL') || str.includes('ISIN');
            })) {
                headerRowIndex = i;
                break;
            }
        }
        if(headerRowIndex === -1) throw new Error(`Could not find standard AMFI headers in Excel`)

        const headers = rawRows[headerRowIndex].map(h=>String(h).trim())
        const dataRows = rawRows.slice(headerRowIndex + 1)

        const symbolIdx = headers.findIndex(h=>h.includes('NSE'))
        const isinIdx = headers.findIndex(h=>h.includes('ISIN'))
        const nameIdx = headers.findIndex(h=>h.includes('Company'))
        const tierIdx = headers.findIndex(h=>h.includes('Categorization'))

        const lookupDB = {}

        for(const row of dataRows) {
            if(!row[symbolIdx] || !row[isinIdx] ) continue

 const symbol = String(row[symbolIdx]).trim().toUpperCase();
            const isin = String(row[isinIdx]).trim().toUpperCase();
            const companyName = String(row[nameIdx]).trim().toUpperCase();
            const tier = String(row[tierIdx]).trim().toUpperCase();

            const profile= {
                companyName,
                isin,
                nseSymbol:symbol,
                marketCapTier: tier
            }

            lookupDB[symbol] = profile
            lookupDB[isin] = profile

        }
        console.log(`Database engine loaded. ${Object.keys(lookupDB).length /2} active profiles indexed`)
        return lookupDB;

    } catch (error) {
        console.log("Error in building dataset: ", error.message)
    }
}
const marketDB = await getlookupDB()
const getMarketCapTier = async(symbol) =>{

    const ticker = symbol
    const record = marketDB[ticker.toUpperCase()]

    if(record){
        const data = {
            company : record.companyName,
            ISIN : record.isin,
            symbol : record.nseSymbol,
            tier : record.marketCapTier
        }
        return data.tier;
    } else {
        console.log(`No records found for ${ticker}`)
    }
}
export default getMarketCapTier;