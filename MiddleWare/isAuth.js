const admin = require("firebase-admin");

const verifyToken = async (token) => {
    let decodedToken;
    try {
        const finalToken = token?.split(" ")[1];
        decodedToken = await admin?.auth().verifyIdToken(finalToken);
        return decodedToken?.email
    } catch (err) {
        return ''
    }
};

module.exports = { verifyToken };
