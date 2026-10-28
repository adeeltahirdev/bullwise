const { initializeApp, getApps, cert } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')

const rawCredentials = process.env.FIREBASE_SERVICE_ACCOUNT

if (!rawCredentials) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is missing')
}

let serviceAccount

try {
    serviceAccount = JSON.parse(rawCredentials)

    // Handle credentials accidentally encoded as JSON twice.
    if (typeof serviceAccount === 'string') {
        serviceAccount = JSON.parse(serviceAccount)
    }
} catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT contains invalid JSON')
}

if (
    !serviceAccount ||
    typeof serviceAccount !== 'object' ||
    !serviceAccount.project_id ||
    !serviceAccount.client_email ||
    !serviceAccount.private_key
) {
    throw new Error('Firebase service-account credentials are incomplete')
}

const app = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({
            projectId: serviceAccount.project_id,
            clientEmail: serviceAccount.client_email,
            privateKey: serviceAccount.private_key.replace(/\\n/g, '\n')
        })
    })

const auth = getAuth(app)
const db = getFirestore(app)

module.exports = { auth, db }
