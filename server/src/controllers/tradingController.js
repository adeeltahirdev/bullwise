
const portfolioService = require('../services/portfolioService')
const marketDataService = require('../services/marketDataService')
const AppError = require('../utils/AppError')

const getPortfolio = async (req, res, next) => {
    try {
        const portfolio = await portfolioService.getPortfolio(req.user.uid)

        res.status(200).json({
            success: true,
            data: portfolio
        })
    } catch (error) {
        next(error)
    }
}

const getQuote = async (req, res, next) => {
    try {
        const quote = await marketDataService.getPreviousClose(req.params.symbol)

        res.status(200).json({
            success: true,
            data: quote
        })
    } catch (error) {
        next(error)
    }
}

const createOrder = async (req, res, next) => {
    try {
        const { symbol, side, quantity } = req.body || {}

        if (typeof quantity !== 'number') {
            throw new AppError('Quantity must be a number', 400)
        }

        const order = await portfolioService.placeOrder(req.user.uid, {
            symbol,
            side,
            quantity
        })

        res.status(201).json({
            success: true,
            data: order
        })
    } catch (error) {
        next(error)
    }
}

const getOrders = async (req, res, next) => {
    try {
        const orders = await portfolioService.getOrders(req.user.uid)

        res.status(200).json({
            success: true,
            data: orders
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getPortfolio,
    getQuote,
    createOrder,
    getOrders
}
