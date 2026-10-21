const { db, auth } = require('../config/firebaseAdmin')
const { FieldValue } = require('firebase-admin/firestore')
const AppError = require('../utils/AppError')

const firebaseKey = process.env.FIREBASE_API_KEY


const forgotPassword = async ({ email }) => {
    if (!firebaseKey) {
        
        throw new AppError('Firebase API key is not configured', 500)
    }

    const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseKey}`,
        
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                requestType: 'PASSWORD_RESET',
                email
            })
        }
    )

    const result = await response.json()

    if (!response.ok) {
        const firebaseError = result.error?.message

         const errors = {
            INVALID_EMAIL: ['Please provide a valid email address', 400],
            USER_NOT_FOUND: ['Unable to process the password reset request', 400],
            TOO_MANY_ATTEMPTS_TRY_LATER: [
                'Too many attempts. Please try again later',
                429
            ]
        }

        const [message, statusCode] = errors[firebaseError] || [
            'Unable to process the password reset request',
            400
        ]

        throw new AppError(message, statusCode)
    }

    return {
        emailSent: true
    }
}


const resendVerificationEmail = async (idToken) => {
    if (!firebaseKey) {
        
        throw new AppError('Firebase API key is not configured', 500)
    }

    try {
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseKey}`,
            
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    requestType: 'VERIFY_EMAIL',
                    idToken
                })
            }
        )

        const result = await response.json()

        if (!response.ok) {
            const firebaseError = result.error?.message

            if (firebaseError === 'EMAIL_NOT_FOUND') {
                throw new AppError('User account was not found', 404)
            }

            if (firebaseError === 'INVALID_ID_TOKEN' ||
                firebaseError === 'TOKEN_EXPIRED') {
                throw new AppError('Invalid or expired authentication token', 401)
            }

            throw new AppError(
                'Unable to send verification email. Please try again.',
                400
            )
        }

        return { emailSent: true }
    } catch (error) {
        if (error instanceof AppError) {
            throw error
        }

        throw new AppError('Unable to process verification request', 500)
    }
}

const getCurrentUser = async (uid) => {
    const firebaseUser = await auth.getUser(uid)

    const userDoc = await db.collection('users').doc(uid).get()

    if (!userDoc.exists) {
        throw new AppError('User profile not found', 404)
    }

    const profile = userDoc.data()

    return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified,
        firstName: profile.firstName,
        lastName: profile.lastName
    }
}

const createUserProfile = async ({ uid, firstName, lastName }) => {
    if (
        typeof firstName !== 'string' ||
        !firstName.trim() ||
        typeof lastName !== 'string' ||
        !lastName.trim()
    ) {
        throw new AppError('First and last name are required', 400)
    }

    const firebaseUser = await auth.getUser(uid)

    if (!firebaseUser.email) {
        throw new AppError('A valid email address is required', 400)
    }

    const userRef = db.collection('users').doc(uid)
    const userDoc = await userRef.get()

    if (userDoc.exists) {
        return userDoc.data()
    }

    const profile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        emailVerified: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    }

    await userRef.create(profile)

    return profile
}


module.exports = {
    forgotPassword,
    resendVerificationEmail,
    getCurrentUser,
    createUserProfile
}