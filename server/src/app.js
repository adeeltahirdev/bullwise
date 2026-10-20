
const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/authRoute')
const errorMiddleware = require('./middleware/errorMiddleware')

const app = express()

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

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
