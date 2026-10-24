const { initializeApp, getApps, applicationDefault } =
    require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')

const app = getApps().length
    ? getApps()[0]
    : initializeApp({ credential: applicationDefault() })

const auth = getAuth(app)
const db = getFirestore(app)

module.exports = { auth, db }
