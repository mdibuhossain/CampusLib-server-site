const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const con = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB successfully connected`)
    } catch {
        console.log(`DB connection failed!!`)
    }
}

module.exports = { connectDB }