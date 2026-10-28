const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const snaptradeController = require('../controllers/snaptradeController')

const router = express.Router()

router.use(authMiddleware)

router.post('/register', snaptradeController.registerUser)
router.post('/connect', snaptradeController.generateConnectionUrl)

module.exports = router
