const AppError = require('../utils/AppError')

const requireVerifiedEmail = (req, res, next) => {
    if (!req.user) {
        return next(new AppError('Authentication required', 401))
    }

    if (!req.user.emailVerified) {
        return next(new AppError(
            'Please verify your email to access this feature', 403
        ))
    }

    next()
}

module.exports = requireVerifiedEmail