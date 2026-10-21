const authService = require('../services/authService')

const registerUser = async (req, res, next) => {
    try {
        const user = await authService.registerUser(req.body)

        res.status(201).json({
            success: true,
            message: user.verificationEmailSent ? 'Account created. Please check your email to verify your account' 
            : 'Account created, but the verification email could not be requested',
            data: user
        })
    } catch (err) {
        next(err)
    }
}

const loginUser = async (req, res, next) => {
    try {
        const result = await authService.loginUser(req.body)

        const { refreshToken, ...userData } = result

        res.cookie('bullwise_refresh', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/auth',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            success: true,
            data: userData
        })
    } catch (err) {
        next(err)
    }
}

const forgotPassword = async (req, res, next) => {
    try {
        await authService.forgotPassword(req.body)

        res.status(200).json({
            success: true,
            message: 'A link has been sent to you for resetting your password'
        })
    } catch (err) {
        next(err)
    }
}

const resendVerificationEmail = async (req, res, next) => {
    try {
        await authService.resendVerificationEmail(req.user.idToken)

        res.status(200).json({
            success: true,
            message: 'A verification email has been sent to you'
        })
    } catch (err) {
        next(err)
    }
}

const refreshUserToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.bullwise_refresh

        const result = await authService.refreshUserToken(refreshToken)

        res.cookie('bullwise_refresh', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/auth',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        })

        res.status(200).json({
            success: true,
            data: {
                uid: result.uid,
                idToken: result.idToken,
                expiresIn: result.expiresIn
            }
        })
    } catch (err) {
        next(err)
    }
}

const logoutUser = async (req, res, next) => {
    try {
        res.clearCookie('bulleise_refresh', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/auth'
        })

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resendVerificationEmail,
    refreshUserToken,
    logoutUser
}