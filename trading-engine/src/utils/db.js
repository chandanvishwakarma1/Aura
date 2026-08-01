import mongoose from "mongoose";
import 'dotenv/config'

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Connected to db ${conn.connection.host}`);
    } catch (error) {
        console.log("Error connecting to database: ", error);
        process.exit(1);
    }
}
export const closeDB = async()=>{
    try {
        await mongoose.disconnect();
        console.log(`Disconnected from db.`);
    } catch (error) {
        console.log("Error disconnecting from database: ", error);
        process.exit(1);
    } 
}