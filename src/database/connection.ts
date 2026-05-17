import mongoose from "mongoose";
import { env } from "../config/env.service";

const DBconnection = async () => {
    try {
        await mongoose.connect(env.mongoURL);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); 
    }
};

export default DBconnection;