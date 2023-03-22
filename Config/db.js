const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const con = await mongoose.connect(process.env.NODE_EVN === "development" ? process.env.MONGO_URI_LOCAL : process.env.MONGO_URI, { dbName: process.env.DB_NAME })
    } catch {
        console.log(`DB connection failed!!`)
    }
    const check = mongoose.connection.readyState;
    if (check == 0) console.log("disconnected");
    else if (check == 1) console.log("connected");
    else if (check == 2) console.log("connecting");
    else if (check == 3) console.log("disconnecting");
}

module.exports = { connectDB }