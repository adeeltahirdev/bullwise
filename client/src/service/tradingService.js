import apiFetch from "./api";

const tradingService = {
    async getPortfolio() {
        const result = await apiFetch('/trading/portfolio')
        return result.data
    },

    async getQuote(symbol) {
        const result = await apiFetch(`/trading/quote/${encodeURIComponent(symbol)}`)
        return result.data
    },

    async placeOrder(order) {
        const result = await apiFetch('/trading/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        })

        return result.data
    },

    async getOrders() {
        const result = await apiFetch('/trading/orders')
        return result.data
    },

    async getHistory(symbol, range = '1M') {
        const result = await apiFetch(`/trading/history/${encodeURIComponent(symbol)}?range=${range}`)

        return result.data
    },

    async getWatchlist() {
    const result = await apiFetch('/trading/watchlist')
    return result.data
},

async addToWatchlist(symbol) {
    const result = await apiFetch('/trading/watchlist', {
        method: 'POST',
        body: JSON.stringify({ symbol })
    })
    return result.data
},

async removeFromWatchlist(symbol) {
    const result = await apiFetch(
        `/trading/watchlist/${encodeURIComponent(symbol)}`,
        { method: 'DELETE' }
    )
    return result.data
},
}

export default tradingService
