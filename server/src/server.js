require('dotenv').config()
const express = require('express')
const connectDB = require('./config/db')
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

// App's routes
app.use('/auth', authRoutes)


app.use(errorMiddleware)

const PORT = process.env.PORT || 5000

async function startServer() {
    await connectDB()

    app.listen(PORT, () => {
        console.log(`Server running on port: ${PORT}`)
    })
}

startServer()