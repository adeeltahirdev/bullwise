
const express = require('express')
const authenticateUser = require('../middleware/authMiddleware')
const tradingController = require('../controllers/tradingController')

const router = express.Router()

router.use(authenticateUser)

router.get('/portfolio', tradingController.getPortfolio)

router.get('/quote/:symbol', tradingController.getQuote)

router.get('/orders', tradingController.getOrders)

router.post('/orders', tradingController.createOrder)

router.get('/history/:symbol', tradingController.getHistoricalBars)

module.exports = router
