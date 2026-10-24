
const { db } = require('../config/firebaseAdmin')
const { FieldValue } = require('firebase-admin/firestore')
const AppError = require('../utils/AppError')
const marketDataService = require('./marketDataService')

const INITIAL_CASH = 100000

const getPortfolioRef = (uid) => {
    if (!uid) throw new AppError('Authentication required', 401)

    return db.collection('portfolios').doc(uid)
}

const getOrCreatePortfolio = async (uid) => {
    const portfolioRef = getPortfolioRef(uid)

    return db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(portfolioRef)

        if (snapshot.exists) return snapshot.data()

        const portfolio = {
            userId: uid,
            cash: INITIAL_CASH,
            positions: {},
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        }

        transaction.create(portfolioRef, portfolio)

        return portfolio
    })
}

const getPortfolio = async (uid) => {
    await getOrCreatePortfolio(uid)

    const portfolioRef = getPortfolioRef(uid)
    const snapshot = await portfolioRef.get()
    const portfolio = snapshot.data()

    const positions = await Promise.all(
        Object.entries(portfolio.positions || {}).map(
            async ([symbol, position]) => {
                try {
                    const quote = await marketDataService.getPreviousClose(symbol)

                    return {
                        symbol,
                        quantity: position.quantity,
                        averagePrice: position.averagePrice,
                        currentPrice: quote.price,
                        marketValue: position.quantity * quote.price,
                        unrealizedProfitLoss:
                            position.quantity *
                            (quote.price - position.averagePrice)
                    }
                } catch {
                    return {
                        symbol,
                        quantity: position.quantity,
                        averagePrice: position.averagePrice,
                        currentPrice: null,
                        marketValue: null,
                        unrealizedProfitLoss: null
                    }
                }
            }
        )
    )

    const pricedPositions = positions.filter(
        (position) => position.marketValue !== null
    )

    const marketValue = pricedPositions.reduce(
        (total, position) => total + position.marketValue,
        0
    )

    const unrealizedProfitLoss = pricedPositions.reduce(
        (total, position) => total + position.unrealizedProfitLoss,
        0
    )

    return {
        userId: uid,
        cash: portfolio.cash,
        positions,
        marketValue,
        portfolioValue: portfolio.cash + marketValue,
        unrealizedProfitLoss,
        valuationComplete: pricedPositions.length === positions.length,
        currency: 'USD'
    }
}

const placeOrder = async (uid, { symbol, side, quantity }) => {
    const ticker = String(symbol || '').trim().toUpperCase()

    if (!/^[A-Z][A-Z0-9.]{0,9}$/.test(ticker)) {
        throw new AppError('Invalid stock symbol', 400)
    }

    if (!['buy', 'sell'].includes(side)) {
        throw new AppError('Side must be buy or sell', 400)
    }

    if (
        typeof quantity !== 'number' ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        quantity > 1000000 ||
        Math.round(quantity * 1000000) !== quantity * 1000000
    ) {
        throw new AppError(
            'Quantity must be positive and have at most 6 decimal places',
            400
        )
    }

    await getOrCreatePortfolio(uid)

    const quote = await marketDataService.getPreviousClose(ticker)
    const price = quote.price
    const total = Math.round(price * quantity * 100) / 100

    if (!Number.isFinite(total) || total <= 0) {
        throw new AppError('Invalid order total', 400)
    }

    const portfolioRef = getPortfolioRef(uid)
    const orderRef = portfolioRef.collection('orders').doc()

    return db.runTransaction(async (transaction) => {
        const portfolioSnapshot = await transaction.get(portfolioRef)

        if (!portfolioSnapshot.exists) {
            throw new AppError('Portfolio not found', 404)
        }

        const portfolio = portfolioSnapshot.data()
        const cash = portfolio.cash
        const positions = { ...(portfolio.positions || {}) }
        const existing = positions[ticker] || {
            quantity: 0,
            averagePrice: 0
        }

        if (side === 'buy') {
            if (cash + 0.000001 < total) {
                throw new AppError('Insufficient virtual cash', 400)
            }

            const newQuantity = existing.quantity + quantity
            const newAveragePrice =
                ((existing.quantity * existing.averagePrice) + total) /
                newQuantity

            positions[ticker] = {
                quantity: newQuantity,
                averagePrice: newAveragePrice
            }

            transaction.update(portfolioRef, {
                cash: Math.round((cash - total) * 100) / 100,
                positions,
                updatedAt: FieldValue.serverTimestamp()
            })
        } else {
            if (existing.quantity + 0.000001 < quantity) {
                throw new AppError('Insufficient shares to sell', 400)
            }

            const remaining = Math.max(0, existing.quantity - quantity)

            if (remaining < 0.000001) {
                delete positions[ticker]
            } else {
                positions[ticker] = {
                    ...existing,
                    quantity: remaining
                }
            }

            transaction.update(portfolioRef, {
                cash: Math.round((cash + total) * 100) / 100,
                positions,
                updatedAt: FieldValue.serverTimestamp()
            })
        }

        const order = {
            id: orderRef.id,
            userId: uid,
            symbol: ticker,
            side,
            quantity,
            price,
            total,
            priceType: 'previous_close',
            status: 'filled',
            createdAt: FieldValue.serverTimestamp()
        }

        transaction.create(orderRef, order)

        return {
            ...order,
            createdAt: new Date().toISOString()
        }
    })
}

const getOrders = async (uid) => {
    await getOrCreatePortfolio(uid)

    const portfolioRef = getPortfolioRef(uid)

    const snapshot = await portfolioRef
        .collection('orders')
        .orderBy('createdAt', 'desc')
        .limit(100)
        .get()

    return snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate?.().toISOString() || null
    }))
}

module.exports = {
    getOrCreatePortfolio,
    getPortfolio,
    placeOrder,
    getOrders
}
