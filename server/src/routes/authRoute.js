const express = require('express')
const authController = require('../controllers/authController')
const validate = require('../middleware/validatationMiddleware')
const authenticateUser = require('../middleware/authMiddleware')
const { createForgotPasswordSchema } = require('../validation/authValidation')

const router = express.Router()

router.post('/forgot-password', validate(createForgotPasswordSchema), authController.forgotPassword)

router.post('/resend-verification-email', authenticateUser, authController.resendVerificationEmail)

router.post('/profile', authenticateUser, authController.createUserProfile)

router.get('/profile', authenticateUser, authController.getCurrentUser)

module.exports = router