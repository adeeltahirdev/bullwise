const authService = require('../services/authService')

const createProfile = async (req, res, next) => {
    try {
        const user = await authService.createProfile({
            uid: req.user.uid,
            email: req.user.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        })

        return res.status(201).json({
            success: true,
            user
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    createProfile
}