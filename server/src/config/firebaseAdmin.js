const { initializeApp, getApps, cert } =
    require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON

if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not configured')
}

const serviceAccount = JSON.parse(serviceAccountJson)

const app = getApps().length
    ? getApps()[0]
    : initializeApp({ credential: cert(serviceAccount) })

const auth = getAuth(app)
const db = getFirestore(app)

module.exports = { auth, db }
