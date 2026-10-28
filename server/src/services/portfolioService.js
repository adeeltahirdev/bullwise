const alpacaService = require('../services/alpacaService')
const AppError = require('../utils/AppError')

const getPortfolio = async () => {
    const [account, brokerPositions] = await Promise.all([
        alpacaService.getAccount(),
        alpacaService.getPositions()
    ])

    const positions = brokerPositions.map((position) => ({
        symbol: position.symbol,
        quantity: Number(position.qty),
        averagePrice: Number(position.avg_entry_price),
        currentPrice: Number(position.current_price),
        marketValue: Number(position.market_value),
        unrealizedProfitLoss: Number(position.unrealized_pl),
        unrealizedProfitLossPercent: Number(position.unrealized_plpc) * 100
    }))

    const marketValue = positions.reduce(
        (total, position) => total + position.marketValue, 0
    )

    const unrealizedProfitLoss = positions.reduce(
        (total, position) => total + position.unrealizedProfitLoss, 0
    )

    return {
        broker: 'alpaca',
        accountId: account.id,
        accountStatus: account.status,
        currency: account.currency,
        cash: Number(account.cash),
        buyingPower: Number(account.buying_power),
        marketValue,
        portfolioValue: Number(account.equity),
        equity: Number(account.equity),
        lastEquity: Number(account.last_equity),
        unrealizedProfitLoss,
        positions
    }
}

const placeOrder = async (uid, { symbol, side, quantity }) => {
    if (!uid) {
        throw new AppError('Authentication required', 401)
    }

    return alpacaService.placeMarketOrder({
        symbol,
        side,
        quantity
    })
}

const getOrders = async (uid) => {
    if (!uid) {
        throw new AppError('Authentication required', 401)
    }

    const brokerOrders = await alpacaService.getOrders()

    return brokerOrders.map((order) => {
        const quantity = Number(order.qty)
        const filledQuantity = Number(order.filled_qty || 0)

        const price = order.filled_avg_price == null
            ? null : Number(order.filled_avg_price)

        return {
            id: order.id,
            createdAt: order.submitted_at || order.created_at,
            Symbol: order.symbol,
            side: order.side,
            quantity,
            filledQuantity,
            price,
            total: price == null ? null : price * filledQuantity,
            status: order.status
        }
    })
}

module.exports = {
    getPortfolio,
    placeOrder,
    getOrders
}
