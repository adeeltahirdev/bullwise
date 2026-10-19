const express = require('express')
const router = express.Router()

const authenticateUser = require('../middleware/authMiddleware')
const {createProfile} = require('../controllers/authController')

router.post('/profile', authenticateUser, createProfile)

module.exports = router