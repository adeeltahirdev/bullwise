const AppError = require('../utils/AppError')

const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: false
    })

    if (error) {
        const message = error.details
            .map((detail) => detail.message || 'Invalid input')
            .filter(Boolean)
            .join(', ')

        return next(new AppError(message || 'Validation failed', 400))
    }

    req.body = value
    next()
}

module.exports = validate