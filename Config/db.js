const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const con = await mongoose.connect(process.env.NODE_EVN === "development" ? process.env.MONGO_URI_LOCAL : process.env.MONGO_URI, { dbName: process.env.DB_NAME })
        console.log(`MongoDB successfully connected`)
    } catch {
        console.log(`DB connection failed!!`)
    }
}

module.exports = { connectDB }