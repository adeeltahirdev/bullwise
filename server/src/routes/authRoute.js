const express = require('express')
const router = express.Router()

const authenticateUser = require('../middleware/authMiddleware')
const {getCurrentuser} = require('../controllers/authController')

router.get('/me', authenticateUser, getCurrentuser)

module.exports = router