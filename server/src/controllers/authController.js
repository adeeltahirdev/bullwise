const authService = require('../services/authService')

const registerUser = async (req, res, next) => {
    try {
        const user = await authService.registerUser(req.body)

        res.status(201).json({
            success: true,
            message: 'Account created successfully! You can now sign in to your account.',
            data: user
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    registerUser
}