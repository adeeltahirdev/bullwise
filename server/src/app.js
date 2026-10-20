
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/authRoute')
const errorMiddleware = require('./middleware/errorMiddleware')

const app = express()

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
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

// API routes
app.use('/auth', authRoutes)

// Centralized error handling must be last
app.use(errorMiddleware)

module.exports = app
