const snaptradeService = require('../services/snaptradeService')

const registerUser = async (req, res, next) => {
    try {
        const result = await snaptradeService.registerUser(req.user.uid)

        res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        next(error)
    }
}

const generateConnectionUrl = async (req, res, next) => {
    try {
        const result = await snaptradeService.generateConnectionUrl(
            req.user.uid
        )

        res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    registerUser,
    generateConnectionUrl
}
