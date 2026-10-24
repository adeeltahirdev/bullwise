const express = require('express')
const router = express.Router()

const authenticateUser = require('../middleware/authMiddleware')

const watchlistController = require('../controllers/watchlistController')

router.use(authenticateUser)

router.get('/', watchlistController.getWatchlist)

router.post('/', watchlistController.addToWatchlist)

router.delete('/:symbol', watchlistController.removeFromWatchlist)

module.exports = router
