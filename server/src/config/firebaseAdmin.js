const { initializeApp, getApps, cert } =
    require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON

if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is missing')
}


const app = getApps().length
    ? getApps()[0]
    : initializeApp({ credential: cert(serviceAccount) })

const auth = getAuth(app)
const db = getFirestore(app)

module.exports = { auth, db }
