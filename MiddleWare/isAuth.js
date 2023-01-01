const admin = require("firebase-admin");
const User = require("../Models/User_Model")

const verifyToken = async (token) => {
    let decodedToken;
    try {
        const finalToken = token?.split(" ")[1];
        decodedToken = await admin?.auth().verifyIdToken(finalToken);
        const checkUser = await User.findOne({ email: decodedToken?.email })
        if (checkUser)
            return decodedToken?.email
        return ''
    } catch (err) {
        return ''
    }
};

module.exports = { verifyToken };
