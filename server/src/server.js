require('dotenv').config()

const app = require('./app')

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
    console.log(`Bullwise API running on port ${PORT}`)
})

server.on('error', (error) => {
    console.error('HTTP server failed:', error.message)
    process.exitCode = 1
})