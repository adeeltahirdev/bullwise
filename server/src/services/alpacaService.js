const axios = require('axios')
const AppError = require('../utils/AppError')


const baseURL = process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets/v2'

if (baseURL !== 'https://paper-api.alpaca.markets/v2') {
    throw new AppError('Bullwise must use the Alpaca paper-trading endpoint')
}

const api = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
        'APCA-API-KEY-ID': process.env.ALPACA_API_KEY,
        'ALPACA-API-SECRET-KEY': process.env.ALPACA_API_SECRET,
        'Content-Type': 'application/json'
    }
})
