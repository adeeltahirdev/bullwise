const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/authRoute')
const tradingRoute = require('./routes/tradingRoute')
const watchlistRoute = require('./routes/watchlistRoute')
const snaptradeRoute = require('./routes/snaptradeRoute')
const errorMiddleware = require('./middleware/errorMiddleware')

const app = express()

app.use(cors({
    origin: process.env.CORS_URL,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Bullwise API is running'
    })
})

app.use('/auth', (req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
})

// API routes
app.use('/auth', authRoutes)
app.use('/trading', tradingRoute)
app.use('/trading/watchlist', watchlistRoute)
app.use('/trading/snaptrade', snaptradeRoute)

// Centralized error handling must be last
app.use(errorMiddleware)

module.exports = app
