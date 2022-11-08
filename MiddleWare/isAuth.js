const verifyToken = async (req, res, next) => {
    const token = req.get('authorization')
    if (!token) {
        req.isAuth = false
        return next()
    }
    let decodedToken
    try {
        const finalToken = token.split(' ')[1]
        decodedToken = await admin.auth().verifyToken(finalToken)
    } catch (err) {
        req.isAuth = false;
        return next()
    }
    if (!decodedToken) {
        req.isAuth = false
        return next()
    }
    req.isAuth = true
    req.decodeEmail = decodedToken.email
    next()
}

module.exports = { verifyToken }