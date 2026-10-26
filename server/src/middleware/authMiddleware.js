const {auth} = require('../config/firebaseAdmin')
const AppError = require('../utils/AppError')

const authenticateUser = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization

        if (!authorization || !authorization.startsWith('Bearer ')) {
            throw new AppError('Authentication required', 401)
        }

        const idToken = authorization.split(' ')[1]

        if (!idToken) {
            throw new AppError('Authentication required', 401)
        }

        const decodedToken = await auth.verifyIdToken(idToken)

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
            idToken
        }

        next()
    } catch (error) {
        if (error instanceof AppError) {
            return next(error)
        }

         console.error('Firebase token verification failed:', {
            code: error.code,
            message: error.message
        })

        return next(new AppError('Invalid or expired authentication token', 401))
    }
}

module.exports = authenticateUser
