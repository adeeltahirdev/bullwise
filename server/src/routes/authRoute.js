const express = require('express')
const authController = require('../controllers/authController')
const validate = require('../middleware/validatationMiddleware')
const { createRegisterSchema } = require('../validation/authValidation')

const router = express.Router()

router.post('/register', validate(createRegisterSchema), authController.registerUser)

module.exports = router