const { initializeApp, getApps, cert } =
    require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT

if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is missing')
}

let serviceAccount

try {
    serviceAccount = JSON.parse(serviceAccountJson)
} catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT must contain valid JSON')
}

const app = getApps().length
    ? getApps()[0]
    : initializeApp({ credential: cert(serviceAccount) })

const auth = getAuth(app)
const db = getFirestore(app)

module.exports = { auth, db }
