import Disclosure from "../models/Disclosure.js";
import getMarketCapTier from "./marketCap.js";
import parseXml from "./xmlParser.js";

const genNseDateString = (daysOffset = 0) => {
    const d = new Date()
    d.setDate(d.getDate() - daysOffset)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}`

}
const formatNseDateToIso = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return dateStr;
    const cleaned = dateStr.trim()

    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned
    const months = {
        jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
        jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };

    // Split "31-Jul-2026"
    const parts = cleaned.split('-');
    if (parts.length !== 3) return dateStr; // Fallback if format changes

    const day = parts[0].padStart(2, '0');
    const month = months[parts[1].toLowerCase()];
    let year = parts[2];

    if (year.length === 2) year = `20${year}`

    if (!month) return dateStr;
    return `${year}-${month}-${day}`; // "2026-07-31"
};
const mapToDisclosure = (xmlText) => {
    const disclosedData = parseXml(xmlText)
    const discloses = []
    const companyInfo = disclosedData.MainI || {}
    const symbol = companyInfo.Symbol
    const filedDate = formatNseDateToIso(companyInfo.DateOfFiling)
    const companyName = companyInfo.NameOfTheCompany



    for (const key in disclosedData) {
        const data = disclosedData[key]
        if (!data || !data.SecuritiesAcquiredOrDisposedTransactionType) {
            console.log(`Skipping - ${key} key is not valid`)
            continue
        }

        const mode = (data.ModeOfAcquisitionOrDisposal || "").trim()
        const acitveModes = ["Market Sale", "Open Market", "Market Purchase"]
        if (!acitveModes.includes(mode)) {
            console.log(`Skipping - ${mode} mode is not valid`)
            continue
        };


        const exchange = (data.ExchangeOnWhichTheTradeWasExecuted || "").trim()
        const instrument = (data.TypeOfInstrument || "").trim()

        const isValidExchange = exchange === 'NSE' || exchange === 'BSE'
        const isValidInstrument = instrument === 'Equity' || instrument === 'Equity Shares'

        if (!isValidExchange || !isValidInstrument) {
            console.log(`Skipping - ${exchange} exchange or ${instrument} intrument is not valid`)
            continue
        }


        const entityName = data.NameOfThePerson
        const transactionType = data.SecuritiesAcquiredOrDisposedTransactionType
        const quantity = Number(data.SecuritiesAcquiredOrDisposedNumberOfSecurity || 0)
        const price = quantity > 0 ? Number(data.SecuritiesAcquiredOrDisposedValueOfSecurity || 0) / quantity : 0
        const disclosedDate = formatNseDateToIso(data.DateOfIntimationToCompany)
        const categoryOfPerson = data.CategoryOfPerson
        const transactionDate = formatNseDateToIso(data.DateOfAllotmentAdviceOrAcquisitionOfSharesOrSaleOfSharesSpecifyToDate) || formatNseDateToIso(data.DateOfAllotmentAdviceOrAcquisitionOfSharesOrSaleOfSharesSpecifyFromDate)
        const source = "nse_insider"
        const rawPayload = xmlText

        const totalTradeValue = (quantity > 0 && price > 0) ? quantity * price : 0;
        const contextRef = `${key}_${symbol}_${entityName}_${price}_${quantity}_${data.disclosedDate}`


        const singleDisclosure = {
            contextRef,
            source,
            exchange,
            symbol,
            entityName,
            companyName,
            transactionType,
            transactionDate,
            disclosedDate,
            categoryOfPerson,
            totalTradeValue,
            profileTarget: "INSIDER",
            filedDate,
            quantity,
            mode,
            price,
            rawPayload
        }
        discloses.push(singleDisclosure)


    }

    // console.log(disclos)
    // const {rawPayload, ...rest} = disclos;
    // console.log(discloses.map(({rawPayload, ...rest})=> rest))
    // console.log(disclosedData.Disclosure1.NameOfThePerson)
    return discloses
}


const fetchFreeInsiderData = async () => {
    try {
        const baseUrl = 'https://nseindia.com';
        const fromDate = genNseDateString(1)
        const toDate = genNseDateString(0)
        const insiderApiUrl = `https://nseindia.com/api/corporates-pit-gg?index=equities&from_date=${fromDate}&to_date=${toDate}`;

        // Advanced Browser Spoofing Headers to bypass Akamai/Cloudflare
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

        console.log("🚀 Step 1: Simulating User Visit to NSE India Home Page...");
        const homeRes = await fetch(baseUrl, { headers: browserHeaders });

        // Correctly read multiple Set-Cookie headers returned by NSE
        const rawCookies = homeRes.headers.getSetCookie ? homeRes.headers.getSetCookie() : [];
        if (rawCookies.length === 0) {
            throw new Error("NSE home page loaded, but security cookies were not generated.");
        }

        // Clean cookies and format them for the next request header
        const cleanCookies = rawCookies.map(cookie => cookie.split(';')[0]).join('; ');

        console.log("⏱️ Human Emulation: Pausing for 3 seconds to generate session token...");
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Inject the freshly grabbed session cookies and simulate an internal site request
        const apiHeaders = {
            ...browserHeaders,
            'Accept': 'application/json, text/plain, */*',
            'Host': '://nseindia.com',
            'Referer': 'https://nseindia.com/companies-listing/corporate-filings-announcements',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'Cookie': cleanCookies
        };

        // Remove navigational headers not allowed in API fetch calls
        delete apiHeaders['Upgrade-Insecure-Requests'];
        delete apiHeaders['Sec-Fetch-User'];

        console.log(`📡 Step 2: Requesting Insider Data Pipeline with Active Session Token...[${fromDate} to ${toDate}]`);
        const dataRes = await fetch(insiderApiUrl, { headers: apiHeaders });

        const text = await dataRes.text();

        if (!text.trim().startsWith('{')) {
            // Log a snippet of the wall response to diagnose issues
            console.log("\n--- Firewall Error Snapshot ---");
            console.log(text.substring(0, 300));
            console.log("-------------------------------\n");
            throw new Error("NSE Firewall blocked the request. The application layer failed session verification.");
        }

        const jsonResult = JSON.parse(text);
        if (!jsonResult.data || !Array.isArray(jsonResult.data)) {
            console.log("❌ Connection completed, but dataset structure is empty.");
            return;
        }

        const disclosures = jsonResult.data;
        console.log(`\n📦 Analysis Engine Active: Scanning ${disclosures.length} documents for insider events...`);

        let disclosuresPushed = 0;

        for (let trade of disclosures) {
            if (trade.regulation !== 'Regulation 7 (2)') continue;
            if (!trade.xmlFileName) continue;

            console.log(`🔍 Inspecting Filings: [${trade.symbol}]`);


            try {
                // Short human delay variance per internal document file fetch
                await new Promise(resolve => setTimeout(resolve, 1200));
                const xmlUrl = new URL(trade.xmlFileName)

                const xmlHeaders = {
                    ...browserHeaders,
                    'Accept': 'application/xml,text/xml,application/xhtml+xml,text/html;q=0.9',
                    'Host': xmlUrl.host, // Dynamically swaps to mops.nseindia.com or archives.nseindia.com
                    'Referer': 'https://www.nseindia.com/',
                    'Cookie': cleanCookies
                };

                const xmlRes = await fetch(trade.xmlFileName, { headers: xmlHeaders });
                const xmlText = await xmlRes.text();

                if (xmlText.includes("Access Denied") || xmlText.includes("Forbidden") || xmlText.trim().startsWith("<!DOCTYPE html>")) {
                    console.log(`Skipping parsing payload for ${trade.symbol} : Endpoint restricted.`)
                    continue
                }
                const disclosedData = mapToDisclosure(xmlText)

                for (const disclosure of disclosedData) {
                    if (!disclosure) continue;
                    const { rawPayload, ...rest } = disclosure
                    // console.log(rest.totalTradeValue)

                    const existing = await Disclosure.findOne({
                        source: disclosure.source,
                        entityName: disclosure.entityName,
                        symbol: disclosure.symbol,
                        disclosedDate: disclosure.disclosedDate,
                        contextRef: disclosure.contextRef,
                        exchange: disclosure.exchange
                    })

                    if (existing) {
                        console.log(`Disclosure already exists - skipping`)
                        continue
                    }

                    const profileTarget = (disclosure.source === "nse_insider") ? "INSIDER" : "WHALE"
                    let profileDisplayTag = '';
                    let systemCopyWeight = 1.0;

                    if (profileTarget === 'INSIDER') {
                        if (disclosure.totalTradeValue > 10000000) {
                            profileDisplayTag = 'SUPER INSIDER'
                            systemCopyWeight = 2.0
                        } else {
                            profileDisplayTag = 'INSIDER'
                            systemCopyWeight = 1
                        }
                    }

                    if (profileTarget === 'WHALE') {
                        continue
                    }
                    const tier = await getMarketCapTier(disclosure.symbol)

                    const name = (disclosure.entityName || "").toUpperCase().trim()
                    const corporateKeywords = [
                        "LIMITED", "LTD", "PRIVATE", "PVT", "LLP", "PARTNERS", "FUND", "TRUST", "CAPITAL", "SECURITIES", "FINANCE", "BANK", "INSURANCE", "INVESTMENTS", "CORP", "HOLDINGS", "ASSET MANAGEMENT", "AMC", "AIF", "VCC", "PTE", "CORPORATION"
                    ]
                    const corpRegex = new RegExp(`\\b(${corporateKeywords.join('|')})\\b`, 'i')
                    const isCorporateEntity = corpRegex.test(name)
                    if (isCorporateEntity) {
                        console.log(`Storing ${disclosure.entityName} as corporate entity - skipping active trade replication`)
                        await Disclosure.create({
                            source: disclosure.source,
                            contextRef: disclosure.contextRef,
                            symbol: disclosure.symbol,
                            profileTarget: "INSIDER",
                            categoryOfPerson: disclosure.categoryOfPerson,
                            companyName: disclosure.companyName,
                            entityName: disclosure.entityName,
                            mode: disclosure.mode,
                            transactionType: disclosure.transactionType,
                            profileDisplayTag,
                            marketCap: tier,
                            systemCopyWeight,
                            transactionDate: disclosure.transactionDate,
                            filedDate: disclosure.filedDate,
                            totalTradeValue: disclosure.totalTradeValue,
                            disclosedDate: disclosure.disclosedDate,
                            price: disclosure.price,
                            processed: true,
                            quantity: disclosure.quantity,
                            rawPayload: disclosure.rawPayload,
                            exchange: disclosure.exchange,
                            isCorporateEntity: true
                        })
                        disclosuresPushed++
                        continue
                    }
                    await Disclosure.create({
                        source: disclosure.source,
                        contextRef: disclosure.contextRef,
                        symbol: disclosure.symbol,
                        profileTarget: "INSIDER",
                        categoryOfPerson: disclosure.categoryOfPerson,
                        companyName: disclosure.companyName,
                        entityName: disclosure.entityName,
                        mode: disclosure.mode,
                        marketCap: tier,
                        profileDisplayTag,
                        systemCopyWeight,
                        totalTradeValue: disclosure.totalTradeValue,
                        transactionType: disclosure.transactionType,
                        transactionDate: disclosure.transactionDate,
                        filedDate: disclosure.filedDate,
                        disclosedDate: disclosure.disclosedDate,
                        price: disclosure.price,
                        processed: false,
                        quantity: disclosure.quantity,
                        rawPayload: disclosure.rawPayload,
                        exchange: disclosure.exchange,
                        isCorporateEntity: false
                    })
                    disclosuresPushed++;
                    console.log(`Successfully parsed trade for ${disclosure.entityName}`)
                }
            } catch (error) {
                console.log(`Error handling file contents for ${trade.symbol} `, error.message);
            }
        }

        console.log(`Pipeline completed run. Total documents saved: ${disclosuresPushed}`)

    } catch (error) {
        console.error("\n💥 Process Interrupted:", error.message);
    }
};

export default fetchFreeInsiderData
