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

module.exports = {
    registerUser
}