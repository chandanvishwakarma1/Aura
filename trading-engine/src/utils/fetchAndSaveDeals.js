import { connectDB, closeDB } from "./db.js";
import Disclosure from "../models/Disclosure.js"
import getMarketCapTier from "./marketCap.js";
import { fetchWithNseSession } from "./nseSession.js";
const formatNseDateToIso = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return dateStr;

    const months = {
        jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
        jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };

    // Split "31-Jul-2026"
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr; // Fallback if format changes

    const day = parts[0].padStart(2, '0');
    const month = months[parts[1].toLowerCase()];
    const year = parts[2];

    if (!month) return dateStr;
    return `${year}-${month}-${day}`; // "2026-07-31"
};

const mapFromBulkBlockDeals = (rawData) => {
    if (!rawData) return []
    const dealDate = rawData.as_on_date || ''
    // console.log(data.BULK_DEALS_DATA)
    const allDeals = [
        ...(rawData.BULK_DEALS_DATA || []).map(d => ({ ...d, _source: 'nse_bulk' })),
        ...(rawData.BLOCK_DEALS_DATA || []).map(d => ({ ...d, _source: 'nse_block' }))
    ]
    return allDeals.map((deal) => {
        const qty = Number(deal.qty) || 0
        const price = Number(deal.watp) || 0
        const source = deal._source
        const totalTradeValue = (qty > 0 && price > 0) ? qty * price : 0;
        const transactionType = deal.buySell
            ? deal.buySell.charAt(0) + deal.buySell.slice(1).toLowerCase()
            : '';



        return {
            companyName: deal.name,
            entityName: deal.clientName,
            transactionType: transactionType,
            symbol: deal.symbol,
            source: source,
            quantity: qty,
            price: price,
            mode: null,
            disclosedDate: formatNseDateToIso(dealDate),
            categoryOfPerson: null,
            totalTradeValue: totalTradeValue,
            profileTarget: "WHALE",
            filedDate: formatNseDateToIso(deal.date),
            transactionDate: formatNseDateToIso(deal.date || dealDate),
            exchange: deal.exchange || 'NSE', //insider also had BSE, what should be here
            rawPayload: deal,
            processed: false,
            isCorporateEntity: false,
            contextRef: `${deal.symbol}_${deal.clientName}_${qty}_${price}_${dealDate}_${totalTradeValue}`

        }
    })
}

const genNseDateString = (daysOffset = 0) => {
    const d = new Date()
    d.setDate(d.getDate() - daysOffset)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
}
const fetchWhaleDealsData = async () => {
    try {
        const baseUrl = 'https://nseindia.com';
        const fromDate = genNseDateString(1);
        const toDate = genNseDateString(0);
        // The highly sensitive live capital market target URL
        // const blockDealsUrl = `${baseUrl}/api/historical/block-deals?from=${fromDate}&to=${toDate}`;
        const largeDealsApiUrl = 'https://www.nseindia.com/api/snapshot-capital-market-largedeal'

        console.log("🚀 Step 1: Establishing NSE session and querying Bulk/Block Deal datasets...");
        const response = await fetchWithNseSession(largeDealsApiUrl);
        if (!response) {
            throw new Error("NSE session or request failed.");
        }
        const text = await response.text();

        if (!text.trim().startsWith('{')) {
            console.log("\n--- Structural Firewall Exception Snapshot ---");
            console.log(text.substring(0, 300));
            console.log("----------------------------------------------\n");
            throw new Error("Firewall blocked the structural token allocation framework.");
        }

        const jsonResult = JSON.parse(text);

        const allDeals = mapFromBulkBlockDeals(jsonResult)
        if (!allDeals || !Array.isArray(allDeals)) {
            console.log("❌ Connection completed, but dataset structure is empty.");
            return;
        }
        // console.log(allDeals[0])

        console.log(`\n📦 Saving fetched deals to DB: Processing ${allDeals.length} data rows...`);
        let newDealsSaved = 0;

        for (const deal of allDeals) {
            if (!deal) {
                console.log(`No deal to process - skipping`)
                continue
            }

            const side = deal.transactionType
            if (side !== 'Buy' && side !== 'Sell') continue;

            const totalTradeValue = deal.totalTradeValue



            try {
                const existing = await Disclosure.findOne({
                    symbol: deal.symbol,
                    entityName: deal.entityName,
                    quantity: deal.quantity,
                    disclosedDate: deal.disclosedDate,
                    price: deal.price,
                    source: deal.source,
                    contextRef: deal.contextRef
                });

                if (existing) {
                    console.log(`Deal already exists - skipping`)
                    continue
                }

                const profileTarget = (deal.source === "nse_insider") ? "INSIDER" : "WHALE"
                let profileDisplayTag = '';
                let systemCopyWeight = 1.0;

                if (profileTarget === 'INSIDER') {
                    continue
                }

                if (profileTarget === 'WHALE') {
                    const capTier = await getMarketCapTier(deal.symbol)
                    let tier = capTier?.split(' ')[0] ?? 'UNKNOWN'
                    tier = tier ? tier : 'UNKNOWN'
                    if (tier === 'MICRO') tier = 'SMALL'


                    if (totalTradeValue >= 100000000) {
                        profileDisplayTag = 'GIANT WHALE'
                        systemCopyWeight = 2.5
                    } else if (totalTradeValue < 100000000) {
                        if (tier === 'SMALL') {
                            profileDisplayTag = 'WHALE TSUNAMI (Smal-Cap Accumulation)'
                            systemCopyWeight = 3.5
                        } else if (tier === 'LARGE' || tier === 'MID') {
                            profileDisplayTag = tier === 'LARGE' ? 'WHALE RIPPLE (Large-Cap Accumulation)' : 'WHALE RIPPLE (Mid-Cap Accumulation)'
                            systemCopyWeight = 0.5
                        } else {
                            profileDisplayTag = 'WHALE'
                            systemCopyWeight = 1
                        }
                    }
                }


                const name = (deal.entityName || "").toUpperCase().trim()
                const corporateKeywords = [
                    "LIMITED", "LTD", "PRIVATE", "PVT", "LLP", "PARTNERS", "TRUST", "CAPITAL", "SECURITIES", "FINANCE", "BANK", "INSURANCE", "INVESTMENTS", "CORP", "HOLDINGS", "ASSET MANAGEMENT", "AMC", "AIF", "VCC", "PTE", "CORPORATION"
                ]
                const corpRegex = new RegExp(`\\b(${corporateKeywords.join('|')})\\b`, 'i')
                const isCorporateEntity = corpRegex.test(name)
                if (isCorporateEntity) {
                    console.log(`Storing ${deal.entityName} as corporate entity.`)
                    await Disclosure.create({
                        ...deal,
                        profileDisplayTag,
                        systemCopyWeight,
                        isCorporateEntity: true,
                    })
                    newDealsSaved++
                    console.log(`   🐳 Whale Move Logged: [${deal.transactionType}] ${deal.entityName} ${side} shares of ${deal.symbol} worth ₹${totalTradeValue.toLocaleString('en-IN')}`);
                    continue
                }
                await Disclosure.create({
                    ...deal,
                    profileDisplayTag,
                    systemCopyWeight,
                    isCorporateEntity: false,
                });
                newDealsSaved++;
                console.log(`   🐳 Whale Move Logged: [${deal.transactionType}] ${deal.entityName} ${side} shares of ${deal.symbol} worth ₹${totalTradeValue.toLocaleString('en-IN')}`);
            } catch (innerErr) {
                console.log(`⚠️ Skip duplicate assignment check error processing: ${innerErr.message}`);
            }
        }

        console.log(`\n🎉 Process completed. Logged ${newDealsSaved} massive whale transactions into the system database.`);
    } catch (error) {
        console.error("\n💥 Critical Whale Pipeline Disturbance:", error.message);
    }
};


export default fetchWhaleDealsData;