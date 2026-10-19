
const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500
    let message = err.message || 'Internal server error'

    if (err.name === 'CastError') {
        statusCode = 400
        message = 'Invalid ID format'
    }

    if (err.name === 'ValidationError') {
        statusCode = 400
        message = err.message
    }

    if (err.code === 11000) {
        statusCode = 409
        message = 'A record with this value already exists'
    }

    if (statusCode >= 500) {
        console.error(err)
        message = 'Internal server error'
    }

    return res.status(statusCode).json({
        success: false,
        message,
    })
}

module.exports = errorMiddleware
