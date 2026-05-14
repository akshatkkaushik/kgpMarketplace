const mongoose = require("mongoose");

// Cache the connection promise so Vercel serverless functions
// reuse the same connection across warm invocations instead of
// opening a new one every time (which causes the 10000ms timeout).
let cached = global._mongooseConnection;

const connectDB = async () => {
    if (cached) {
        return cached;
    }
    try {
        cached = await mongoose.connect(process.env.MONGO_URI);
        global._mongooseConnection = cached;
        console.log("Database connected successfully");
        return cached;
    } catch (error) {
        console.log(error.message);
        throw error;
    }
}
module.exports = connectDB