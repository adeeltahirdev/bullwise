const {initializeApp, getApps, applicationDefault} = require('firebase-admin/app')
const {getAuth} = require('firebase-admin/auth')

const app = getApps().length ? getApps()[0] : initializeApp({
    credential: applicationDefault()
})

module.exports = {
    auth: getAuth(app)
}