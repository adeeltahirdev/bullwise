import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../config/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import tradingService from '../service/tradingService.js'

function Dashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSignOut() {
        setError('')

        try {
            setLoading(true)

            await signOut(auth)

            navigate('/login', { replace: true })
        } catch (err) {
            console.error('Sign-out failed:', err.code)
            setError('Unable to sign out. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const testTradingAccount = async () => {
        try {
            const account = await tradingService.getAccount()
            console.log('Trading account: ', account)
        } catch (error) {
            console.error('Trading account request failed: ', error.message)
        }
    }

    return (
        <div className="container">
            <section className="form">
                <p className="title">Bullwise Dashboard</p>

                <p className='message'>
                    Welcome, {user?.firstName} {user?.lastName}
                </p>

                <p className="message">
                    You're signed in as {user?.email}.
                </p>

                {error && (
                    <p className="error-message" role="alert">
                        {error}
                    </p>
                )}

                <button
                    className="submit"
                    type="button"
                    onClick={handleSignOut}
                    disabled={loading}
                >
                    {loading ? 'Signing out...' : 'Sign out'}
                </button>

                <button className='submit' onClick={testTradingAccount}>
                    Trading
                </button>

                <p className="signin">
                    Need to sign in again? <Link to="/login">Login</Link>
                </p>
            </section>
        </div>
    )
}

export default Dashboard
