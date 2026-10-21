const { db, auth } = require('../config/firebaseAdmin')
const { FieldValue } = require('firebase-admin/firestore')
const AppError = require('../utils/AppError')

const firbaseKey = process.env.FIREBASE_API_KEY

const registerUser = async ({ firstName, lastName, email, password }) => {
    if (!firbaseKey) {
        throw new AppError('Firebase API key is not configured', 500)
    }

    const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firbaseKey}`,
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
            `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firbaseKey}`,
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

const loginUser = async ({ email, password }) => {
    if (!firbaseKey) {
        throw new AppError('Firebase API key is not configured', 500)
    }

    const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firbaseKey}`,
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
            EMAIL_NOT_FOUND: ['Invalid email or password', 401],
            INVALID_PASSWORD: ['Invalid email or password', 401],
            INVALID_LOGIN_CREDENTIALS: ['Invalid email or password', 401],
            USER_DISABLED: ['This account has been disabled', 403],
            TOO_MANY_ATTEMPTS_TRY_LATER: [
                'Too many attempts. Please try again later',
                429
            ]
        }

        const [message, statusCode] = errors[firebaseError] || [
            'Unable to sign in with the provided credentials',
            401
        ]

        throw new AppError(message, statusCode)
    }

    return {
        uid: result.localId,
        email: result.email,
        idToken: result.idToken,
        refreshToken: result.refreshToken,
        expiresIn: Number(result.expiresIn),
        emailVerified: result.emailVerified
    }
}

const forgotPassword = async ({ email }) => {
    if (!firbaseKey) {
        throw new AppError('Firebase API key is not configured', 500)
    }

    const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firbaseKey}`,
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
    if (!firbaseKey) {
        throw new AppError('Firebase API key is not configured', 500)
    }

    try {
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firbaseKey}`,
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

const refreshUserToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new AppError('Refresh token is required', 401)
    }

    const response = await fetch(
        `https://securetoken.googleapis.com/v1/token?key=${firbaseKey}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            })
        }
    )

    const result = await response.json()

    if (!response.ok) {
        throw new AppError('You are logged out! Please login again')
    }

    return {
        uid: result.user_id,
        idToken: result.id_token,
        refreshToken: result.refresh_token,
        expiresIn: result.expires_in
    }
}

const getCurrentUser = async (uid) => {
    const user = await auth.getUser(uid)

    const userDoc = await db .collection('users').doc(uid).get()

    if (!userDoc.exists) {
        throw new AppError('User profile not found', 404)
    }

    const profile = userDoc.data()

    return {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        firstName: profile.firstName,
        lastName: profile.lastName
    }
}


module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resendVerificationEmail,
    refreshUserToken,
    getCurrentUser
}