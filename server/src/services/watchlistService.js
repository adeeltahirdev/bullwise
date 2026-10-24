
const { db } = require('../config/firebaseAdmin')
const { FieldValue } = require('firebase-admin/firestore')
const AppError = require('../utils/AppError')
const marketDataService = require('./marketDataService')

const MAX_WATCHLIST_SIZE = 50

const getWatchlistRef = (uid) => {
    if (!uid) {
        throw new AppError('Authentication required', 401)
    }

    return db.collection('watchlists').doc(uid)
}

const normalizeSymbol = (symbol) => {
    const ticker = String(symbol || '').trim().toUpperCase()

    if (!/^[A-Z][A-Z0-9.]{0,9}$/.test(ticker)) {
        throw new AppError('Invalid stock symbol', 400)
    }

    return ticker
}

const getWatchlist = async (uid) => {
    const ref = getWatchlistRef(uid)
    const snapshot = await ref.get()

    if (!snapshot.exists) {
        return []
    }

    return snapshot.data().symbols || []
}

const addToWatchlist = async (uid, symbol) => {
    const ticker = normalizeSymbol(symbol)

    // Verify that market data is available for this symbol.
    await marketDataService.getPreviousClose(ticker)

    const ref = getWatchlistRef(uid)

    return db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(ref)
        const symbols = snapshot.exists
            ? snapshot.data().symbols || []
            : []

        if (symbols.includes(ticker)) {
            throw new AppError('Stock is already in your watchlist', 409)
        }

        if (symbols.length >= MAX_WATCHLIST_SIZE) {
            throw new AppError('Watchlist limit reached', 400)
        }

        const updatedSymbols = [...symbols, ticker]

        transaction.set(ref, {
            userId: uid,
            symbols: updatedSymbols,
            updatedAt: FieldValue.serverTimestamp()
        }, { merge: true })

        return updatedSymbols
    })
}

const removeFromWatchlist = async (uid, symbol) => {
    const ticker = normalizeSymbol(symbol)
    const ref = getWatchlistRef(uid)

    return db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(ref)

        if (!snapshot.exists) {
            throw new AppError('Watchlist not found', 404)
        }

        const symbols = snapshot.data().symbols || []

        if (!symbols.includes(ticker)) {
            throw new AppError('Stock is not in your watchlist', 404)
        }

        const updatedSymbols = symbols.filter(
            (item) => item !== ticker
        )

        transaction.update(ref, {
            symbols: updatedSymbols,
            updatedAt: FieldValue.serverTimestamp()
        })

        return updatedSymbols
    })
}

module.exports = {
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist
}
