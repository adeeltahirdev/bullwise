const admin = require('../config/firebaseAdmin')

async function authenticateUser(req, res, next) {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Authentication token is required'
        })
    }

    const idToken = authHeader.slice(7).trim()

    if (!idToken) {
        return res.status(401).json({
            success: false,
            message: 'Authentication token is required'
        })
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken)

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email || null,
            emailVerified: decodedToken.email_verified === true
        }

        next()
    } catch (error) {
        if (error.code?.startsWith('auth/')) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired authentication token'
            })
        }

        next(error)
    }
}

module.exports = authenticateUser