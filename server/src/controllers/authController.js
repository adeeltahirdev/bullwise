const authService = require('../services/authService')

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

const getCurrentUser = async (req, res, next) => {
    try {
        const user = await authService.getCurrentUser(req.user.uid)

        res.status(200).json({
            success: true,
            data: user
        })
    } catch (err) {
        next(err)
    }
}

const createUserProfile = async (req, res, next) => {
    try {
        const user = await authService.createUserProfile({
            uid: req.user.uid,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        })

        res.status(201).json({
            success: true,
            message: 'User profile created successfully',
            data: user
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    forgotPassword,
    resendVerificationEmail,
    getCurrentUser,
    createUserProfile
}