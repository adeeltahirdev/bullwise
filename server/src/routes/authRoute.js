const express = require('express')
const authController = require('../controllers/authController')
const validate = require('../middleware/validatationMiddleware')
const { createRegisterSchema, createLoginSchema } = require('../validation/authValidation')

const router = express.Router()

router.post('/register', validate(createRegisterSchema), authController.registerUser)

router.post('/login', validate(createLoginSchema), authController.loginUser)

module.exports = router