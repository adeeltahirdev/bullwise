
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    onAuthStateChanged,
    sendEmailVerification,
    reload,
} from 'firebase/auth'

import { auth } from '../config/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'

function VerifyEmail() {
    const [user, setUser] = useState(auth.currentUser)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const {refreshProfile} = useAuth()

    useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser)
    })

    return unsubscribe
    }, [])

    async function handleResend() {
        setError('')
        setMessage('')

        if (!auth.currentUser) {
            setError('Please sign in again to resend the verification email.')
            return
        }

        try {
            setLoading(true)
            await sendEmailVerification(auth.currentUser)
            setMessage('A new verification email has been sent.')
        } catch (err) {
            console.error('Verification email error:', err.code)
            setError('Unable to send the email. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

async function handleCheckVerification() {
    setError('')
    setMessage('')

    const currentUser = auth.currentUser

    if (!currentUser) {
        setError('Please sign in to check your verification status.')
        return
    }

    try {
        setLoading(true)

        await reload(currentUser)

        if (auth.currentUser?.emailVerified) {
            await refreshProfile()
            navigate('/dashboard', { replace: true })
        } else {
            setError('Your email is not verified yet. Check your inbox.')
        }
    } catch (err) {
        console.error('Verification check error:', err)

        setError('Unable to check verification status. Try again.')
    } finally {
        setLoading(false)
    }
}

    return (
        <div className="container">
            <section className="form">
                <p className="title">Verify your email</p>

                <p className="message">
                    We sent a verification link to your email address.
                    Open that email and click the link to verify your account.
                </p>

                {user?.email && (
                    <p className="message">
                        Email: <strong>{user.email}</strong>
                    </p>
                )}

                {message && (
                    <p className="success-message" role="status">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="error-message" role="alert">
                        {error}
                    </p>
                )}

                <button
                    className="submit"
                    type="button"
                    onClick={handleCheckVerification}
                    disabled={loading}
                >
                    Check verification
                </button>

                <button
                    className="submit secondary-btn"
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                >
                    {loading ? 'Please wait...' : 'Resend verification email'}
                </button>

                <p className="signin">
                    Already verified? <Link to="/login">Sign in</Link>
                </p>
            </section>
        </div>
    )
}

export default VerifyEmail
