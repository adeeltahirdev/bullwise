
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../config/firebase.js'

function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()

        setError('')
        setMessage('')

        if (!email.trim()) {
            setError('Please enter your email address.')
            return
        }

        try {
            setLoading(true)

            await sendPasswordResetEmail(auth, email.trim())

            setMessage(
                'If an account exists with this email, you will receive a password reset link shortly.'
            )
        } catch (err) {
            console.error('Password reset request failed:', err.code)

            const messages = {
                'auth/invalid-email': 'Please enter a valid email address.',
                'auth/too-many-requests':
                    'Too many attempts. Please try again later.',
                'auth/network-request-failed':
                    'Network error. Please check your internet connection.',
            }

            if (messages[err.code]) {
                setError(messages[err.code])
            } else {
                // Avoid revealing whether an email is registered.
                setMessage(
                    'If an account exists with this email, you will receive a password reset link shortly.'
                )
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container">
            <form className="form" onSubmit={handleSubmit}>
                <p className="title">Reset Password</p>

                <p className="message">
                    Enter your email address and we will send you a link to reset
                    your password.
                </p>

                <label>
                    <input
                        required
                        name="email"
                        type="email"
                        className="input"
                        placeholder=" "
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <span>Email</span>
                </label>

                {error && (
                    <p className="error-message" role="alert">
                        {error}
                    </p>
                )}

                {message && (
                    <p className="success-message" role="status">
                        {message}
                    </p>
                )}

                <button
                    className="submit"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <p className="signin">
                    Remember your password? <Link to="/login">Log in</Link>
                </p>
            </form>
        </div>
    )
}

export default ForgotPassword
