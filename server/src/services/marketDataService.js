const axios = require('axios')
const AppError = require('../utils/AppError')

const apiKey = process.env.MASSIVE_API_KEY

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
        throw new AppError('Market data API key is not configured', 500)
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

const getHistoricalBars = async (symbol, range = '1M') => {
    const ticker = String(symbol || '').trim().toUpperCase()

     if (!/^[A-Z][A-Z0-9.]{0,9}$/.test(ticker)) {
        throw new AppError('Invalid stock symbol', 400)
    }

    const ranges = {
        '1M': 30,
        '3M': 90,
        '1Y': 365
    }

    if (!Object.hasOwn(ranges, range)) {
        throw new AppError('Unsupported chart range', 400)
    }

    if (!apiKey) {
        throw new AppError('Market data API key is not configured', 500)
    }

    const to = new Date()
    const from = new Date(to)
    from.setUTCDate(from.getUTCDate() - ranges[range])

    const formatDate = (date) => date.toISOString().slice(0, 10)

    try {
        const response = await massiveClient.get(`/v2/aggs/ticker/${encodeURIComponent(ticker)}/range/1/day/${formatDate(from)}/${formatDate(to)}`, {
            params: {
                adjusted: true,
                sort: 'asc',
                limit: 5000,
                apiKey
            }
        })

        const data = response.data

        if (data.status === 'ERROR' || !Array.isArray(data.results) || data.results.length === 0) {
            throw new AppError(`no historical price data available for ${ticker}`, 404)
        }

        const bars = data.results.map((bar) => ({
            time: Math.floor(bar.t / 1000),
            open: bar.o,
            high: bar.h,
            low: bar.l,
            close: bar.c,
            volume: bar.v
        }))

        return {
            symbol: ticker,
            range,
            priceType: 'historical_daily',
            bars
        }
    } catch (error) {
        if (error instanceof AppError) {
            throw error
        }

        const status = error.response?.status

        console.error('Historical market data request failed: ', status || error.code)

        if (status === 401 || status === 403) {
            throw new AppError('market data authentication or plan access failed', 502)
        }

        if (status === 429) {
            throw new AppError('Market data rate limit reached', 503)
        }

        throw new AppError('Unable to retrieve historical market data', 502)
    }
}

module.exports = {
    getPreviousClose,
    getHistoricalBars
}
