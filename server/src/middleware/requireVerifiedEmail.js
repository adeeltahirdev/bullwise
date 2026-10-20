
const { auth } = require('../config/firebaseAdmin')
const AppError = require('../utils/AppError')

const requireVerifiedEmail = async (req, res, next) => {
    try {
        if (!req.user?.uid) {
            throw new AppError('Authentication required', 401)
        }

        const user = await auth.getUser(req.user.uid)

        if (!user.emailVerified) {
            throw new AppError(
                'Please verify your email to access this feature',
                403
            )
        }

        req.user.emailVerified = user.emailVerified

        next()
    } catch (error) {
        if (error instanceof AppError) {
            return next(error)
        }

        if (error.code === 'auth/user-not-found') {
            return next(new AppError('User account not found', 401))
        }

        return next(
            new AppError('Unable to verify account status', 500)
        )
    }
}

module.exports = requireVerifiedEmail
