// Shared NSE session helper — establishes Akamai/Cloudflare cookies once
// and reuses them for subsequent NSE API calls.

const BASE_URL = 'https://www.nseindia.com';

const browserHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1'
};

let sessionCookies = null;
let sessionPromise = null;

const establishSession = async () => {
    try {
        const homeRes = await fetch(BASE_URL, { headers: browserHeaders });
        const rawCookies = homeRes.headers.getSetCookie ? homeRes.headers.getSetCookie() : [];
        if (rawCookies.length === 0) {
            throw new Error("NSE home page loaded, but security cookies were not generated.");
        }
        sessionCookies = rawCookies.map(cookie => cookie.split(';')[0]).join('; ');
        return sessionCookies;
    } catch (error) {
        console.error("Failed to establish NSE session: ", error.message);
        return null;
    }
};

const getSession = async () => {
    if (sessionCookies) return sessionCookies;
    if (!sessionPromise) {
        sessionPromise = establishSession();
    }
    return sessionPromise;
};

const resetSession = () => {
    sessionCookies = null;
    sessionPromise = null;
};

/**
 * Fetch an NSE API endpoint with a valid session cookie.
 * Retries once with a fresh session if the first attempt is blocked.
 */
export const fetchWithNseSession = async (url, options = {}) => {
    const cookies = await getSession();
    if (!cookies) return null;

    const apiHeaders = {
        ...browserHeaders,
        'Accept': 'application/json, text/plain, */*',
        'Host': 'www.nseindia.com',
        'Referer': `${BASE_URL}/market-data/live-equity-market`,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Cookie': cookies,
        ...options.headers
    };
    delete apiHeaders['Upgrade-Insecure-Requests'];
    delete apiHeaders['Sec-Fetch-User'];

    try {
        const res = await fetch(url, { ...options, headers: apiHeaders });
        if (!res.ok) {
            if(res.status === 403){
                console.warn(`Asset lookup blocked by nse.`)
                return null
            }
            // Session may have expired — retry once with a fresh session
            resetSession();
            const freshCookies = await getSession();
            if (!freshCookies) return null;
            apiHeaders['Cookie'] = freshCookies;
            const retryRes = await fetch(url, { ...options, headers: apiHeaders });
            if (!retryRes.ok) {
                console.error(`NSE API request failed with status ${retryRes.status}: ${url}`);
                return null;
            }
            return retryRes;
        }
        return res;
    } catch (error) {
        console.error("NSE API request error: ", error.message);
        return null;
    }
};

/**
 * Fetch the current price for an NSE-listed symbol.
 * Returns the last price (number) or null on failure.
 */
export const getNsePrice = async (symbol) => {
    const url = `${BASE_URL}/api/quote-equity?symbol=${encodeURIComponent(symbol)}`;
    const res = await fetchWithNseSession(url);
    if (!res) return null;

    try {
        const data = await res.json();
        const price = data?.priceInfo?.lastPrice;
        if (price === undefined || price === null) {
            console.warn(`NSE price missing for ${symbol}. API response: `, data);
            return null;
        }
        return price;
    } catch (error) {
        console.error(`Failed parsing NSE price for ${symbol}: `, error.message);
        return null;
    }
};
// getNsePrice('RELIANCE')