const express = require('express')
const authController = require('../controllers/authController')
const validate = require('../middleware/validatationMiddleware')
const authenticateUser = require('../middleware/authMiddleware')
const { createRegisterSchema, createLoginSchema, createForgotPasswordSchema } = require('../validation/authValidation')

const router = express.Router()

router.post('/register', validate(createRegisterSchema), authController.registerUser)

router.post('/login', validate(createLoginSchema), authController.loginUser)

router.post('/forgot-password', validate(createForgotPasswordSchema), authController.forgotPassword)

router.post('/resend-verification-email', authenticateUser, authController.resendVerificationEmail)

router.post('/refresh-token', authController.refreshUserToken)

router.post('/logout', authController.logoutUser)

router.get('/profile', authenticateUser, authController.getCurrentUser)

module.exports = router