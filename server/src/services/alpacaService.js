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
        'APACA-API-SECRET-KEY': process.env.ALPACA_API_SECRET,
        'Content-Type': 'application/json'
    }
})

const getAccount = async () => {
    try {
        const { data } = await api.get('/account')
        return data
    } catch (error) {
        throw new AppError(
            'Failed to retrieve Alpaca account',
            error.response?.status || 502
        )
    }
}

const getPositions = async () => {
    try {
        const { data } = await api.get('/positions')
        return data
    } catch (error) {
        throw new AppError(
            'Failed to retrieve Alpaca positions',
            error.response?.status || 502
        )
    }
}

const getOrders = async () => {
    try {
        const { data } = await api.get('/orders', {
            params: {
                status: 'all',
                limit: 100,
                direction: 'desc'
            }
        })
        return data
    } catch (error) {
        throw new AppError(
            'Failed to retrieve Alpaca orders',
            error.response?.status || 502
        )
    }
}

const placeMarketOrder = async ({ symbol, side, quantity }) => {
    try {
        const { data } = await api.post('/orders', {
            symbol,
            side,
            qty: quantity,
            type: 'market',
            time_in_force: 'day'
        })
        return data
    } catch (error) {
        throw new AppError(
            'Failed to place Alpaca order',
            error.response?.status || 502
        )
    }
}

module.exports = {
    getAccount,
    getPositions,
    getOrders,
    placeMarketOrder
}
