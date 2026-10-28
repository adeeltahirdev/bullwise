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


const getAccounts = async (req, res, next) => {
    try {
        const accounts = await snaptradeService.getAccounts(req.user.uid)

        res.status(200).json({
            success: true,
            data: accounts
        })
    } catch (error) {
        next(error)
    }
}


module.exports = {
    registerUser,
    generateConnectionUrl,
    getAccounts
}
