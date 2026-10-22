const express = require('express')
const authenticateUser = require('../middleware/authMiddleware')
const tradingController = require('../controllers/tradingController')

const router = express.Router()

router.get('/account', authenticateUser, tradingController.getTradingAccount)

module.exports = router