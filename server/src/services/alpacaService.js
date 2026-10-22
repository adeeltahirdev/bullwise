const axios = require('axios')
const AppError = require('../utils/AppError')

const alpacaClient = axios.create({
    baseURL: process.env.ALPACA_BASE_URL,
    headers: {
        'APCA-API-KEY-ID': process.env.ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': process.env.ALPACA_SECRET_KEY
    },
    timeout: 10000
})

const getAccount = async () => {
    try {
        const response = await alpacaClient.get('/account')

        return {
            status: response.data.status,
            currency: response.data.currency,
            cash: response.data.cash,
            portfolioValue: response.data.portfolio_value,
            buyingPower: response.data.buying_power,
            equity: response.data.equity
        }
    } catch (error) {
        if (error.response?.status === 401) {
            throw new AppError('Alpaca authentication failed. Check your Alpaca API credentials', 502)
        }

        console.error('Alpaca account request failed:', error.response?.status || error.code || 'Unknown error')

        throw new AppError('Unable to retrieve the paper trading account', 502)
    }
}

module.exports = {
    getAccount
}