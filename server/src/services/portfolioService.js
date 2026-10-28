const alpacaService = require('../services/alpacaService')
const AppError = require('../utils/AppError')

const getPortfolio = async () => {
    cosnt [account, brokerPositions] = await Promise.all([
        alpacaService.getAccount(),
        alpacaService.getPositions()
    ])

    const posittions = brokerPositions.map((posittion) => ({
        symbol: posittion.symbol,
        quantity: Number(posittion.qty),
        averagePrice: Number(posittion.avg_entry_price),
        currentPrice: Number(posittion.current_price),
        marketValue: Number(posittion.market_value),
        unrealizedProfitLoss: Number(posittion.unrealized_pl),
        unrealizedProfitLossPercent: Number(posittion.unrealized_plpc) *100
    }))

    const marketValue = posittions.reduce(
        (total, posittion) => total + posittion.marketValue, 0
    )

    const unrealizedProfitLoss = posittions.reduce(
        (total, posittion) => total + posittion.unrealizedProfitLoss, 0
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
        posittions
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
        throw new AppError('Authnetication required', 401)
    }

    return alpacaService.getOrders()
}

module.exports = {
    getPortfolio,
    placeOrder,
    getOrders
}
