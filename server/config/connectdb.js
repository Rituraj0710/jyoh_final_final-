import mongoose from "mongoose"; 

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 2000; // 2 seconds

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async (DATABASE_URL) =>{
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    try {
      await mongoose.connect(DATABASE_URL);
      console.log("DB connected successfully...");
      return;
    } catch (error) {
      attempt += 1;
      console.error(`MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES})`, error?.message || error);
      if (attempt >= MAX_RETRIES) {
        console.error("Exceeded maximum MongoDB connection attempts. Exiting.");
        throw error;
      }
      await wait(RETRY_DELAY_MS);
    }
  }
}

export default connectDB;