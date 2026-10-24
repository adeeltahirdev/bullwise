const axios = require('axios')
const AppError = require('../utils/AppError')

const apiKey = process.env.MASSIVE_API_URL

const massiveClient = axios.create({
    baseURL: 'https://api.massive.com',
    timeout: 10000
})

const getPreviousClose = async (symbol) => {
    const ticker = String(symbol || '').trim().toUpperCase()

    if (!/^[A-Z][A-Z0-9.]{0,9}$/.test(ticker)) {
        throw new AppError('Invalid stock symbol', 400)
    }

    if (!apiKey) {
        throw new AppError('Market data API key is no configured', 500)
    }

    try {
        const response = await massiveClient.get(`/v2/aggs/ticker/${encodeURIComponent(ticker)}/prev`, {
            params: {
                adjusted: true,
                apiKey
            }
        })

        const price = response.data?.results?.[0]?.c

        if (response.data?.status === 'ERROR' || typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
            throw new AppError(`No previous closing price is available for ${ticker}`, 404)
        }

        return {
            symbol: ticker,
            price,
            priceType: 'previous_close',
            currency: 'USD'
        }
    } catch (error) {
        if (error instanceof AppError) {
            throw error
        }

        const status = error.response?.status

        console.error('Market data request failed: ', status || error.code)

        if (status === 401 || status === 404) {
            throw new AppError('Market data authentication failed', 502)
        }

        if (status === 429) {
            throw new AppError('Market data rate limit reached', 503)
        }

        throw new AppError('Unable to retrieve market data', 502)
    }
}

module.exports = {
    getPreviousClose
}
