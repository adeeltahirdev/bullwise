const { db, auth } = require('../config/firebaseAdmin')
const { FieldValue } = require('firebase-admin/firestore')
const AppError = require('../utils/AppError')

const registerUser = async ({ firstName, lastName, email, password }) => {
    if (!process.env.FIREBASE_API_KEY) {
        throw new AppError('Firebase API key is not configured', 500)
    }

    const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.FIREBASE_API_KEY}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password,
                returnSecureToken: true
            })
        }
    )

    const result = await response.json()

    if (!response.ok) {
        const firebaseError = result.error?.message

        const errors = {
            EMAIL_EXISTS: [
                'An account with this email already exists',
                409
            ],
            INVALID_EMAIL: [
                'Please provide a valid email address',
                400
            ],
            INVALID_PASSWORD: [
                'Password does not meet Firebase password requirements',
                400
            ],
            WEAK_PASSWORD: [
                'Password does not meet Firebase password requirements',
                400
            ],
            TOO_MANY_ATTEMPTS_TRY_LATER: [
                'Too many attempts. Please try again later',
                429
            ]
        }

        const [message, statusCode] = errors[firebaseError] || [
            'Unable to register with the provided details',
            400
        ]

        throw new AppError(message, statusCode)
    }

    const { localId: uid, idToken, refreshToken, expiresIn } = result

    try {
        await db.collection('users').doc(uid).create({
            uid,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: result.email,
            emailVerified: false,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        })
    } catch (error) {
        try {
            await auth.deleteUser(uid)
        } catch (cleanupError) {
            console.error(
                'Could not clean up Firebase account after profile creation failed:',
                cleanupError.message
            )
        }

        throw new AppError(
            'Account profile could not be created. Please try again.',
            500
        )
    }

    let verificationEmailSent = false

    try {
        
        const verificationResponse = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${process.env.FIREBASE_API_KEY}`,
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

        verificationEmailSent = verificationResponse.ok

        if (!verificationResponse.ok) {
            const verificationError = await verificationResponse.json()

            console.error('Firebase verification email error:', verificationError.error?.message)
        }
    } catch (error) {
        console.error('verification email request failed:', error.message)
    }

    return {
        uid,
        email: result.email,
        idToken,
        refreshToken,
        expiresIn: Number(expiresIn),
        verificationEmailSent
    }
}

module.exports = { registerUser }