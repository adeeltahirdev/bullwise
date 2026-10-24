
const { db } = require('../config/firebaseAdmin')
const { FieldValue } = require('firebase-admin/firestore')
const AppError = require('../utils/AppError')

const INITIAL_CASH = 100000

const getOrCreatePortfolio = async (uid) => {
    if (!uid) {
        throw new AppError('Authentication required', 401)
    }

    const portfolioRef = db.collection('portfolios').doc(uid)

    return db.runTransaction(async (transaction) => {
        const portfolioDoc = await transaction.get(portfolioRef)

        if (portfolioDoc.exists) {
            return portfolioDoc.data()
        }

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

module.exports = {
    getOrCreatePortfolio
}
