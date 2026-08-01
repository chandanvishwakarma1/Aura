import { closeDB, connectDB } from "../utils/db.js";
import Disclosure from "../models/Disclosure.js";

await connectDB()

const disclosure = await Disclosure.find({ processed: false, isCorporateEntity: false })
const rawCheck = await Disclosure.find({ symbol: 'ATALREAL' })

if (rawCheck) {
    console.log(Disclosure.collection.name)
    console.log(rawCheck._id.toString())
    console.log(JSON.stringify(rawCheck, null, 2))
} else {
    console.log('PINELABS not found by direct')
}
closeDB()