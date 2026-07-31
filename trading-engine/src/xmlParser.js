import { XMLParser } from 'fast-xml-parser'

const parser = new XMLParser({ ignoreAttributes: false});
const xml = `
This XML file does not appear to have any style information associated with it. The document tree is shown below.
<!-- PIT V2.0 (30-04-2026) -->
<xbrli:xbrl xmlns:in-bse-co="http://www.bseindia.com/xbrl/co/2017-09-15/in-bse-co" xmlns:in-bse-co-roles="http://www.bseindia.com/xbrl/co/2017-09-15/in-bse-co-roles" xmlns:xbrldt="http://xbrl.org/2005/xbrldt" xmlns:nonnum="http://www.xbrl.org/dtr/type/non-numeric" xmlns:in-bse-co-type="http://www.bseindia.com/xbrl/co/2017-09-15/in-bse-co-types" xmlns:link="http://www.xbrl.org/2003/linkbase" xmlns:net="http://www.xbrl.org/2009/role/net" xmlns:num="http://www.xbrl.org/dtr/type/numeric" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:iso4217="http://www.xbrl.org/2003/iso4217" xmlns:negated="http://www.xbrl.org/2009/role/negated" xmlns:xbrldi="http://xbrl.org/2006/xbrldi" xmlns:xbrli="http://www.xbrl.org/2003/instance" xmlns:xl="http://www.xbrl.org/2003/XLink">
<link:schemaRef xlink:type="simple" xlink:href="in-bse-co-2017-09-15.xsd"/>
<xbrli:context id="MainI">
<xbrli:entity>
<xbrli:identifier scheme="http://www.bseindia.com/bse-cg/ScripCode">507685</xbrli:identifier>
</xbrli:entity>
<xbrli:period>
<xbrli:instant>2026-07-30</xbrli:instant>
</xbrli:period>
</xbrli:context>
<xbrli:context id="Disclosure1">
<xbrli:entity>
<xbrli:identifier scheme="http://www.bseindia.com/bse-cg/ScripCode">507685</xbrli:identifier>
</xbrli:entity>
<xbrli:period>
<xbrli:instant>2026-07-30</xbrli:instant>
</xbrli:period>
<xbrli:scenario>
<xbrldi:typedMember dimension="in-bse-co:ChangeInHoldingOfSecuritiesOfPromotersAxis">
<in-bse-co:ChangeInHoldingOfSecuritiesOfPromotersDomain>Disclosure1</in-bse-co:ChangeInHoldingOfSecuritiesOfPromotersDomain>
</xbrldi:typedMember>
</xbrli:scenario>
</xbrli:context>
<xbrli:context id="Disclosure2">
<xbrli:entity>
<xbrli:identifier scheme="http://www.bseindia.com/bse-cg/ScripCode">507685</xbrli:identifier>
</xbrli:entity>
<xbrli:period>
<xbrli:instant>2026-07-30</xbrli:instant>
</xbrli:period>
<xbrli:scenario>
<xbrldi:typedMember dimension="in-bse-co:ChangeInHoldingOfSecuritiesOfPromotersAxis">
<in-bse-co:ChangeInHoldingOfSecuritiesOfPromotersDomain>Disclosure2</in-bse-co:ChangeInHoldingOfSecuritiesOfPromotersDomain>
</xbrldi:typedMember>
</xbrli:scenario>
</xbrli:context>
<xbrli:unit id="INR">
<xbrli:measure>iso4217:INR</xbrli:measure>
</xbrli:unit>
<xbrli:unit id="pure">
<xbrli:measure>xbrli:pure</xbrli:measure>
</xbrli:unit>
<xbrli:unit id="shares">
<xbrli:measure>xbrli:shares</xbrli:measure>
</xbrli:unit>
<in-bse-co:ScripCode contextRef="MainI">507685</in-bse-co:ScripCode>
<in-bse-co:Symbol contextRef="MainI">WIPRO</in-bse-co:Symbol>
<in-bse-co:MSEISymbol contextRef="MainI">NOTLISTED</in-bse-co:MSEISymbol>
<in-bse-co:NameOfTheCompany contextRef="MainI">WIPRO LIMITED</in-bse-co:NameOfTheCompany>
<in-bse-co:NameOfTheSignatory contextRef="MainI">M SANAULLA KHAN</in-bse-co:NameOfTheSignatory>
<in-bse-co:DesignationOfSignatory contextRef="MainI">Company Secretary and Compliance Officer</in-bse-co:DesignationOfSignatory>
<in-bse-co:Place contextRef="MainI">BANGALORE</in-bse-co:Place>
<in-bse-co:DateOfFiling contextRef="MainI">2026-07-30</in-bse-co:DateOfFiling>
<in-bse-co:ISINCode contextRef="MainI">INE075A01022</in-bse-co:ISINCode>
<in-bse-co:DisclosureUnderRegulation contextRef="MainI">Regulation 7 (2)</in-bse-co:DisclosureUnderRegulation>
<in-bse-co:RevisedFilling contextRef="MainI">false</in-bse-co:RevisedFilling>
<in-bse-co:TypeOfInstrument contextRef="Disclosure1">Any other instrument</in-bse-co:TypeOfInstrument>
<in-bse-co:TypeOfInstrumentOthers contextRef="Disclosure1">ADR</in-bse-co:TypeOfInstrumentOthers>
<in-bse-co:CategoryOfPerson contextRef="Disclosure1">Designated Person</in-bse-co:CategoryOfPerson>
<in-bse-co:NameOfThePerson contextRef="Disclosure1">Kartik Jayaraman</in-bse-co:NameOfThePerson>
<in-bse-co:SecuritiesHeldPriorToAcquisitionOrDisposalNumberOfSecurity contextRef="Disclosure1" unitRef="shares" decimals="INF">0</in-bse-co:SecuritiesHeldPriorToAcquisitionOrDisposalNumberOfSecurity>
<in-bse-co:SecuritiesHeldPriorToAcquisitionOrDisposalPercentageOfShareholding contextRef="Disclosure1" unitRef="pure" decimals="INF">0</in-bse-co:SecuritiesHeldPriorToAcquisitionOrDisposalPercentageOfShareholding>
<in-bse-co:SecuritiesAcquiredOrDisposedNumberOfSecurity contextRef="Disclosure1" unitRef="shares" decimals="INF">11252</in-bse-co:SecuritiesAcquiredOrDisposedNumberOfSecurity>
<in-bse-co:SecuritiesAcquiredOrDisposedValueOfSecurity contextRef="Disclosure1" unitRef="INR" decimals="0">2067704</in-bse-co:SecuritiesAcquiredOrDisposedValueOfSecurity>
<in-bse-co:SecuritiesAcquiredOrDisposedTransactionType contextRef="Disclosure1">Buy</in-bse-co:SecuritiesAcquiredOrDisposedTransactionType>
<in-bse-co:SecuritiesHeldPostAcquistionOrDisposalNumberOfSecurity contextRef="Disclosure1" unitRef="shares" decimals="INF">11252</in-bse-co:SecuritiesHeldPostAcquistionOrDisposalNumberOfSecurity>
<in-bse-co:SecuritiesHeldPostAcquistionOrDisposalPercentageOfShareholding contextRef="Disclosure1" unitRef="pure" decimals="INF">0</in-bse-co:SecuritiesHeldPostAcquistionOrDisposalPercentageOfShareholding>
<in-bse-co:DateOfAllotmentAdviceOrAcquisitionOfSharesOrSaleOfSharesSpecifyFromDate contextRef="Disclosure1">2026-07-29</in-bse-co:DateOfAllotmentAdviceOrAcquisitionOfSharesOrSaleOfSharesSpecifyFromDate>
<in-bse-co:DateOfAllotmentAdviceOrAcquisitionOfSharesOrSaleOfSharesSpecifyToDate contextRef="Disclosure1">2026-07-29</in-bse-co:DateOfAllotmentAdviceOrAcquisitionOfSharesOrSaleOfSharesSpecifyToDate>
<in-bse-co:ModeOfAcquisitionOrDisposal contextRef="Disclosure1">ESOP</in-bse-co:ModeOfAcquisitionOrDisposal>
<in-bse-co:DateOfIntimationToCompany contextRef="Disclosure1">2026-07-29</in-bse-co:DateOfIntimationToCompany>
<in-bse-co:ExchangeOnWhichTheTradeWasExecuted contextRef="Disclosure1">NA</in-bse-co:ExchangeOnWhichTheTradeWasExecuted>
<in-bse-co:DetailsOfChangeInHoldingOfSecuritiesOfPromotersEmployeeOrDirectorOfAListedCompanyAndOtherSuchPersonsTextBlock contextRef="Disclosure1">The value of the securities is arrived by multiplying the number of shares by the market value of ADRs as on the date of allotment with RBI reference rate. Shares acquired pursuant to exercise of ADS PSUs/RSUs. Kartik Jayaraman is a Non-Resident Indian and currently does not hold a PAN. Hence, AAAAA1234A was inserted under PAN column in Form C as the same is mandatory field. </in-bse-co:DetailsOfChangeInHoldingOfSecuritiesOfPromotersEmployeeOrDirectorOfAListedCompanyAndOtherSuchPersonsTextBlock>
<in-bse-co:TypeOfInstrument contextRef="Disclosure2">Any other instrument</in-bse-co:TypeOfInstrument>
<in-bse-co:TypeOfInstrumentOthers contextRef="Disclosure2">ADR</in-bse-co:TypeOfInstrumentOthers>
<in-bse-co:CategoryOfPerson contextRef="Disclosure2">Designated Person</in-bse-co:CategoryOfPerson>
<in-bse-co:NameOfThePerson contextRef="Disclosure2">Kartik Jayaraman</in-bse-co:NameOfThePerson>
<in-bse-co:SecuritiesHeldPriorToAcquisitionOrDisposalNumberOfSecurity contextRef="Disclosure2" unitRef="shares" decimals="INF">11252</in-bse-co:SecuritiesHeldPriorToAcquisitionOrDisposalNumberOfSecurity>
<in-bse-co:SecuritiesHeldPriorToAcquisitionOrDisposalPercentageOfShareholding contextRef="Disclosure2" unitRef="pure" decimals="INF">0</in-bse-co:SecuritiesHeldPriorToAcquisitionOrDisposalPercentageOfShareholding>
<in-bse-co:SecuritiesAcquiredOrDisposedNumberOfSecurity contextRef="Disclosure2" unitRef="shares" decimals="INF">170</in-bse-co:SecuritiesAcquiredOrDisposedNumberOfSecurity>
<in-bse-co:SecuritiesAcquiredOrDisposedValueOfSecurity contextRef="Disclosure2" unitRef="INR" decimals="0">31240</in-bse-co:SecuritiesAcquiredOrDisposedValueOfSecurity>
<in-bse-co:SecuritiesAcquiredOrDisposedTransactionType contextRef="Disclosure2">Sell</in-bse-co:SecuritiesAcquiredOrDisposedTransactionType>
<in-bse-co:SecuritiesHeldPostAcquistionOrDisposalNumberOfSecurity contextRef="Disclosure2" unitRef="shares" decimals="INF">11082</in-bse-co:SecuritiesHeldPostAcquistionOrDisposalNumberOfSecurity>
<in-bse-co:SecuritiesHeldPostAcquistionOrDisposalPercentageOfShareholding contextRef="Disclosure2" unitRef="pure" decimals="INF">0</in-bse-co:SecuritiesHeldPostAcquistionOrDisposalPercentageOfShareholding>
<in-bse-co:DateOfAllotmentAdviceOrAcquisitionOfSharesOrSaleOfSharesSpecifyFromDate contextRef="Disclosure2">2026-07-29</in-bse-co:DateOfAllotmentAdviceOrAcquisitionOfSharesOrSaleOfSharesSpecifyFromDate>
<in-bse-co:DateOfAllotmentAdviceOrAcquisitionOfSharesOrSaleOfSharesSpecifyToDate contextRef="Disclosure2">2026-07-29</in-bse-co:DateOfAllotmentAdviceOrAcquisitionOfSharesOrSaleOfSharesSpecifyToDate>
<in-bse-co:ModeOfAcquisitionOrDisposal contextRef="Disclosure2">ESOP</in-bse-co:ModeOfAcquisitionOrDisposal>
<in-bse-co:DateOfIntimationToCompany contextRef="Disclosure2">2026-07-29</in-bse-co:DateOfIntimationToCompany>
<in-bse-co:ExchangeOnWhichTheTradeWasExecuted contextRef="Disclosure2">NA</in-bse-co:ExchangeOnWhichTheTradeWasExecuted>
<in-bse-co:DetailsOfChangeInHoldingOfSecuritiesOfPromotersEmployeeOrDirectorOfAListedCompanyAndOtherSuchPersonsTextBlock contextRef="Disclosure2">Sale pursuant to exercise of ADS RSUs/PSUs through cashless mode. The value of the securities is arrived by multiplying number of shares by the market value of ADRs with the exchange rate. Sale was executed on NYSE. Kartik Jayaraman is a Non-Resident Indian and currently does not hold a PAN. Hence, AAAAA1234A was inserted under PAN column in Form C as the same is mandatory field.</in-bse-co:DetailsOfChangeInHoldingOfSecuritiesOfPromotersEmployeeOrDirectorOfAListedCompanyAndOtherSuchPersonsTextBlock>
</xbrli:xbrl>
`
const xmlNew=`
This XML file does not appear to have any style information associated with it. The document tree is shown below.
<!-- PIT V2.0 (30-04-2026) -->
<xbrli:xbrl xmlns:in-bse-co="http://www.bseindia.com/xbrl/co/2017-09-15/in-bse-co" xmlns:in-bse-co-roles="http://www.bseindia.com/xbrl/co/2017-09-15/in-bse-co-roles" xmlns:xbrldt="http://xbrl.org/2005/xbrldt" xmlns:nonnum="http://www.xbrl.org/dtr/type/non-numeric" xmlns:in-bse-co-type="http://www.bseindia.com/xbrl/co/2017-09-15/in-bse-co-types" xmlns:link="http://www.xbrl.org/2003/linkbase" xmlns:net="http://www.xbrl.org/2009/role/net" xmlns:num="http://www.xbrl.org/dtr/type/numeric" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:iso4217="http://www.xbrl.org/2003/iso4217" xmlns:negated="http://www.xbrl.org/2009/role/negated" xmlns:xbrldi="http://xbrl.org/2006/xbrldi" xmlns:xbrli="http://www.xbrl.org/2003/instance" xmlns:xl="http://www.xbrl.org/2003/XLink">
<link:schemaRef xlink:type="simple" xlink:href="in-bse-co-2017-09-15.xsd"/>
<xbrli:context id="MainI">
<xbrli:entity>
<xbrli:identifier scheme="http://www.bseindia.com/bse-cg/ScripCode">544484</xbrli:identifier>
</xbrli:entity>
<xbrli:period>
<xbrli:instant>2026-07-29</xbrli:instant>
</xbrli:period>
</xbrli:context>
<xbrli:context id="Disclosure1">
<xbrli:entity>
<xbrli:identifier scheme="http://www.bseindia.com/bse-cg/ScripCode">544484</xbrli:identifier>
</xbrli:entity>
<xbrli:period>
<xbrli:instant>2026-07-29</xbrli:instant>
</xbrli:period>
<xbrli:scenario>
<xbrldi:typedMember dimension="in-bse-co:ChangeInHoldingOfSecuritiesOfPromotersAxis">
<in-bse-co:ChangeInHoldingOfSecuritiesOfPromotersDomain>Disclosure1</in-bse-co:ChangeInHoldingOfSecuritiesOfPromotersDomain>
</xbrldi:typedMember>
</xbrli:scenario>
</xbrli:context>
<xbrli:context id="Disclosure2">
<xbrli:entity>
<xbrli:identifier scheme="http://www.bseindia.com/bse-cg/ScripCode">544484</xbrli:identifier>
</xbrli:entity>
<xbrli:period>
<xbrli:instant>2026-07-29</xbrli:instant>
</xbrli:period>
<xbrli:scenario>
<xbrldi:typedMember dimension="in-bse-co:ChangeInHoldingOfSecuritiesOfPromotersAxis">
<in-bse-co:ChangeInHoldingOfSecuritiesOfPromotersDomain>Disclosure2</in-bse-co:ChangeInHoldingOfSecuritiesOfPromotersDomain>
</xbrldi:typedMember>
</xbrli:scenario>
</xbrli:context>
<xbrli:unit id="INR">
<xbrli:measure>iso4217:INR</xbrli:measure>
</xbrli:unit>
<xbrli:unit id="pure">
<xbrli:measure>xbrli:pure</xbrli:measure>
</xbrli:unit>
<xbrli:unit id="shares">
<xbrli:measure>xbrli:shares</xbrli:measure>
</xbrli:unit>
<in-bse-co:ScripCode contextRef="MainI">544484</in-bse-co:ScripCode>
<in-bse-co:Symbol contextRef="MainI">BLUESTONE</in-bse-co:Symbol>
<in-bse-co:MSEISymbol contextRef="MainI">NOTLISTED</in-bse-co:MSEISymbol>
<in-bse-co:NameOfTheCompany contextRef="MainI"> BlueStone Jewellery and Lifestyle Limited</in-bse-co:NameOfTheCompany>
<in-bse-co:NameOfTheSignatory contextRef="MainI">GAURAV SINGH KUSHWAHA</in-bse-co:NameOfTheSignatory>
<in-bse-co:DesignationOfSignatory contextRef="MainI">Director</in-bse-co:DesignationOfSignatory>
<in-bse-co:Place contextRef="MainI">Mumbai</in-bse-co:Place>
<in-bse-co:DateOfFiling contextRef="MainI">2026-07-29</in-bse-co:DateOfFiling>
<in-bse-co:ISINCode contextRef="MainI">INE304W01038</in-bse-co:ISINCode>
<in-bse-co:DisclosureUnderRegulation contextRef="MainI">Regulation 7 (2)</in-bse-co:DisclosureUnderRegulation>
<in-bse-co:RevisedFilling contextRef="MainI">false</in-bse-co:RevisedFilling>
<in-bse-co:TypeOfInstrument contextRef="Disclosure1">Equity</in-bse-co:TypeOfInstrument>
<in-bse-co:CategoryOfPerson contextRef="Disclosure1">Designated Person</in-bse-co:CategoryOfPerson>
<in-bse-co:NameOfThePerson contextRef="Disclosure1">Sandip Sadekar</in-bse-co:NameOfThePerson>
<in-bse-co:SecuritiesHeldPriorToAcquisitionOrDisposalNumberOfSecurity contextRef="Disclosure1" unitRef="shares" decimals="INF">8003</in-bse-co:SecuritiesHeldPriorToAcquisitionOrDisposalNumberOfSecurity>
<in-bse-co:SecuritiesHeldPriorToAcquisitionOrDisposalPercentageOfShareholding contextRef="Disclosure1" unitRef="pure" decimals="INF">0.0001</in-bse-co:SecuritiesHeldPriorToAcquisitionOrDisposalPercentageOfShareholding>
<in-bse-co:SecuritiesAcquiredOrDisposedNumberOfSecurity contextRef="Disclosure1" unitRef="shares" decimals="INF">500</in-bse-co:SecuritiesAcquiredOrDisposedNumberOfSecurity>
<in-bse-co:SecuritiesAcquiredOrDisposedValueOfSecurity contextRef="Disclosure1" unitRef="INR" decimals="0">392500</in-bse-co:SecuritiesAcquiredOrDisposedValueOfSecurity>
<in-bse-co:SecuritiesAcquiredOrDisposedTransactionType contextRef="Disclosure1">Sell</in-bse-co:SecuritiesAcquiredOrDisposedTransactionType>
<in-bse-co:SecuritiesHeldPostAcquistionOrDisposalNumberOfSecurity contextRef="Disclosure1" unitRef="shares" decimals="INF">7503</in-bse-co:SecuritiesHeldPostAcquistionOrDisposalNumberOfSecurity>
<in-bse-co:SecuritiesHeldPostAcquistionOrDisposalPercentageOfShareholding contextRef="Disclosure1" unitRef="pure" decimals="INF">0</in-bse-co:SecuritiesHeldPostAcquistionOrDisposalPercentageOfShareholding>
<in-bse-co:DateOfAllotmentAdviceOrAcquisitionOfSharesOrSaleOfSharesSpecifyFromDate contextRef="Disclosure1">2026-07-27</in-bse-co:DateOfAllotmentAdviceOrAcquisitionOfSharesOrSaleOfSharesSpecifyFromDate>
<in-bse-co:DateOfAllotmentAdviceOrAcquisitionOfSharesOrSaleOfSharesSpecifyToDate contextRef="Disclosure1">2026-07-27</in-bse-co:DateOfAllotmentAdviceOrAcquisitionOfSharesOrSaleOfSharesSpecifyToDate>
<in-bse-co:ModeOfAcquisitionOrDisposal contextRef="Disclosure1">Market Sale</in-bse-co:ModeOfAcquisitionOrDisposal>
<in-bse-co:DateOfIntimationToCompany contextRef="Disclosure1">2026-07-29</in-bse-co:DateOfIntimationToCompany>
<in-bse-co:ExchangeOnWhichTheTradeWasExecuted contextRef="Disclosure1">NSE</in-bse-co:ExchangeOnWhichTheTradeWasExecuted>
<in-bse-co:TypeOfInstrument contextRef="Disclosure2">Equity</in-bse-co:TypeOfInstrument>
<in-bse-co:CategoryOfPerson contextRef="Disclosure2">Designated Person</in-bse-co:CategoryOfPerson>
<in-bse-co:NameOfThePerson contextRef="Disclosure2">Sandip Sadekar</in-bse-co:NameOfThePerson>
<in-bse-co:SecuritiesHeldPriorToAcquisitionOrDisposalNumberOfSecurity contextRef="Disclosure2" unitRef="shares" decimals="INF">7503</in-bse-co:SecuritiesHeldPriorToAcquisitionOrDisposalNumberOfSecurity>
<in-bse-co:SecuritiesHeldPriorToAcquisitionOrDisposalPercentageOfShareholding contextRef="Disclosure2" unitRef="pure" decimals="INF">0</in-bse-co:SecuritiesHeldPriorToAcquisitionOrDisposalPercentageOfShareholding>
<in-bse-co:SecuritiesAcquiredOrDisposedNumberOfSecurity contextRef="Disclosure2" unitRef="shares" decimals="INF">500</in-bse-co:SecuritiesAcquiredOrDisposedNumberOfSecurity>
<in-bse-co:SecuritiesAcquiredOrDisposedValueOfSecurity contextRef="Disclosure2" unitRef="INR" decimals="0">400000</in-bse-co:SecuritiesAcquiredOrDisposedValueOfSecurity>
<in-bse-co:SecuritiesAcquiredOrDisposedTransactionType contextRef="Disclosure2">Sell</in-bse-co:SecuritiesAcquiredOrDisposedTransactionType>
<in-bse-co:SecuritiesHeldPostAcquistionOrDisposalNumberOfSecurity contextRef="Disclosure2" unitRef="shares" decimals="INF">7003</in-bse-co:SecuritiesHeldPostAcquistionOrDisposalNumberOfSecurity>
<in-bse-co:SecuritiesHeldPostAcquistionOrDisposalPercentageOfShareholding contextRef="Disclosure2" unitRef="pure" decimals="INF">0</in-bse-co:SecuritiesHeldPostAcquistionOrDisposalPercentageOfShareholding>
<in-bse-co:DateOfAllotmentAdviceOrAcquisitionOfSharesOrSaleOfSharesSpecifyFromDate contextRef="Disclosure2">2026-07-27</in-bse-co:DateOfAllotmentAdviceOrAcquisitionOfSharesOrSaleOfSharesSpecifyFromDate>
<in-bse-co:DateOfAllotmentAdviceOrAcquisitionOfSharesOrSaleOfSharesSpecifyToDate contextRef="Disclosure2">2026-07-27</in-bse-co:DateOfAllotmentAdviceOrAcquisitionOfSharesOrSaleOfSharesSpecifyToDate>
<in-bse-co:ModeOfAcquisitionOrDisposal contextRef="Disclosure2">Market Sale</in-bse-co:ModeOfAcquisitionOrDisposal>
<in-bse-co:DateOfIntimationToCompany contextRef="Disclosure2">2026-07-29</in-bse-co:DateOfIntimationToCompany>
<in-bse-co:ExchangeOnWhichTheTradeWasExecuted contextRef="Disclosure2">NSE</in-bse-co:ExchangeOnWhichTheTradeWasExecuted>
</xbrli:xbrl>
`
const parseXml = (xml) => {

    const parsedXbrl = parser.parse(xml)['xbrli:xbrl']
    
    const toArray = (value) => {
      if (value === null || value === undefined) {
        return [];
      }
      if (Array.isArray(value)) {
        return value;
      }
      return [value];
    }
    const clean = {}
    
    for(const fieldName in parsedXbrl){
        const entries = toArray(parsedXbrl[fieldName])
    
        for(const entry of entries){
            const contextRef = entry['@_contextRef']
            const value = entry['#text']
            if(!contextRef) continue;
            if(!clean[contextRef]){
                clean[contextRef] = {}
            }
            clean[contextRef][fieldName.split(':')[1]] = entry['#text']
        }
    }
    // console.log(clean)
    return clean
}

// console.log(clean)
// parseXml(xmlNew)
export default parseXml
// const onlyDisclosures ={}
// for(const contextRef in clean){
//     const disclosure = clean[contextRef]
//     if(!disclosure.SecuritiesAcquiredOrDisposedTransactionType) continue
//     onlyDisclosures[contextRef] = disclosure
// }
// console.log(onlyDisclosures)
