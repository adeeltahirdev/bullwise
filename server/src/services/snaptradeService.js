
const { Snaptrade, SnaptradeAuth } = require('snaptrade-typescript-sdk')
const { db } = require('../config/firebaseAdmin')
const { FieldValue } = require('firebase-admin/firestore')
const AppError = require('../utils/AppError')

const clientId = process.env.SNAPTRADE_CLIENT_ID
const consumerKey = process.env.SNAPTRADE_CONSUMER_KEY

if (!clientId || !consumerKey) {
    throw new Error('SnapTrade credentials are missing')
}

const snaptrade = new Snaptrade({
    auth: SnaptradeAuth.commercialApiKey({
        clientId,
        consumerKey
    })
})

const registerUser = async (firebaseUid) => {
    if (!firebaseUid) {
        throw new AppError('Authentication required', 401)
    }

    const userRef = db.collection('snaptradeUsers').doc(firebaseUid)
    const existingUser = await userRef.get()

    if (existingUser.exists) {
        return {
            registered: true,
            alreadyRegistered: true
        }
    }

    const snaptradeUserId = `bullwise_${firebaseUid}`

    const response =
        await snaptrade.authentication.registerSnapTradeUser({
            userId: snaptradeUserId
        })

    const { userId, userSecret } = response.data

    if (!userId || !userSecret) {
        throw new AppError(
            'SnapTrade registration returned incomplete credentials',
            502
        )
    }

    await userRef.create({
        firebaseUid,
        snaptradeUserId: userId,
        userSecret,
        createdAt: FieldValue.serverTimestamp()
    })

    return {
        registered: true,
        alreadyRegistered: false
    }
}

const generateConnectionUrl = async (firebaseUid) => {
    if (!firebaseUid) {
        throw new AppError('Authentication required', 401)
    }

    const userRef = db.collection('snaptradeUsers').doc(firebaseUid)
    const userSnapshot = await userRef.get()

    if (!userSnapshot.exists) {
        throw new AppError(
            'SnapTrade user is not registered',
            404
        )
    }

    const { snaptradeUserId, userSecret } = userSnapshot.data()

    const response =
        await snaptrade.authentication.loginSnapTradeUser({
            userId: snaptradeUserId,
            userSecret,
            connectionType: 'read'
        })

    if (!response.data.redirectURI) {
        throw new AppError(
            'Failed to generate brokerage connection URL',
            502
        )
    }

    return { redirectURI: response.data.redirectURI }
}


const getAccounts = async (firebaseUid) => {
    if (!firebaseUid) {
        throw new AppError('Authentication required', 401)
    }

    const userRef = db.collection('snaptradeUsers').doc(firebaseUid)
    const userSnapshot = await userRef.get()

    if (!userSnapshot.exists) {
        throw new AppError('SnapTrade user is not registered', 404)
    }

    const { snaptradeUserId, userSecret } = userSnapshot.data()

    const response = await snaptrade.accountInformation.listUserAccounts({
        userId: snaptradeUserId,
        userSecret
    })

    return response.data
}


const getPositions = async (firebaseUid, accountId) => {
    if (!firebaseUid) {
        throw new AppError('Authentication required', 401)
    }

    if (!accountId || typeof accountId !== 'string') {
        throw new AppError('A valid account ID is required', 400)
    }

    const userRef = db.collection('snaptradeUsers').doc(firebaseUid)
    const userSnapshot = await userRef.get()

    if (!userSnapshot.exists) {
        throw new AppError('SnapTrade user is not registered', 404)
    }

    const { snaptradeUserId, userSecret } = userSnapshot.data()

    // Verify that the requested account belongs to this user.
    const accountsResponse =
        await snaptrade.accountInformation.listUserAccounts({
            userId: snaptradeUserId,
            userSecret
        })

    const accounts = accountsResponse.data

    const accountExists = Array.isArray(accounts) &&
        accounts.some(account => account.id === accountId)

    if (!accountExists) {
        throw new AppError(
            'Brokerage account not found for this user',
            404
        )
    }

    const response =
        await snaptrade.accountInformation.getAllAccountPositions({
            accountId,
            userId: snaptradeUserId,
            userSecret
        })

    return response.data
}



module.exports = {
    registerUser,
    generateConnectionUrl,
    getAccounts,
    getPositions
}
