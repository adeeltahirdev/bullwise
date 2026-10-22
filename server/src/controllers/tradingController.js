const alpacaService = require('../services/alpacaService')

const getTradingAccount = async (req, res, next) => {
    try {
        const account = await alpacaService.getAccount()

        res.status(200).json({
            success: true,
            data: account
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getTradingAccount
}