require('dotenv').config()
const express = require('express')
const connectDB = require('./config/db')
const cors = require('cors')
const authRoutes = require('./routes/authRoute')


const app = express()

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

connectDB()

// App's routes
app.use('/auth', authRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`)
})