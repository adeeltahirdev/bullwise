
const express = require('express')
const authenticateUser = require('../middleware/authMiddleware')
const {
    getPortfolio,
    getQuote,
    createOrder,
    getOrders
} = require('../controllers/tradingController')

const router = express.Router()

router.use(authenticateUser)

router.get('/portfolio', getPortfolio)
router.get('/quote/:symbol', getQuote)
router.get('/orders', getOrders)
router.post('/orders', createOrder)

module.exports = router
