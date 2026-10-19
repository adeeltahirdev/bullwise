const mongoose = require('mongoose')

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Connected to Database successfully')
    } catch (error) {
        console.error('Database connection failed:', error.message)
    }
}

module.exports = connectDB