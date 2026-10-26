const joi =require('joi')

const createRegisterSchema = joi.object({
    firstName: joi.string().trim().min(2).max(50).required(),
    lastName: joi.string().trim().min(2).max(50).required(),
    email: joi.string().trim().email().max(254).required(),
    password: joi.string().trim().min(8).required(),
    confirmPassword: joi.string().valid(joi.ref('password')).required()
}).unknown(false)

const createLoginSchema = joi.object({
    email: joi.string().trim().email().max(254).required(),
    password: joi.string().trim().required()
}).unknown(false)

const createForgotPasswordSchema = joi.object({
    email: joi.string().trim().email().max(254).required()
}).unknown(false)

module.exports = {
    createRegisterSchema,
    createLoginSchema,
    createForgotPasswordSchema
}