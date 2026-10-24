import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../config/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import tradingService from '../service/tradingService.js'
import TradingDashboard from '../components/TradingDashboard.jsx'

function Dashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [account, setAccount] = useState(null)
    const [accountLoading, setAccountLoading] = useState(true)
    const [accountError, setAccountError] = useState('')

    useEffect(() => {
        let isMounted = true

        const loadAccount = async () => {
            try {
                const data = await tradingService.getAccount()

                if (isMounted) {
                    setAccount(data)
                }
            } catch (error) {
                if (isMounted) {
                    setAccountError(error.message || 'Unable to load trading account')
                }
            }finally {
                if (isMounted) {
                    setAccountLoading(false)
                }
            }
        }

        loadAccount()

        return () => {
            isMounted = false
        }

    },[])

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

                <p className="signin">
                    Need to sign in again? <Link to="/login">Login</Link>
                </p>
            </section>

            <section>
                <h2>Paper Trading Account</h2>

                {accountLoading ? (
                    <p>Loading account...</p>
                ) : accountError ? (
                    <p className='error-message'>{accountError}</p>
                ) : account ? (
                    <div>
                        <p>Status: {account.status}</p>
                        <p>Currency: {account.currency}</p>
                        <p>Cash: {Number(account.cash).toLocaleString('en-us', {
                            style: 'currency',
                            currency: account.currency
                        })}</p>
                        <p>Portfolio Value: {Number(account.portfolioValue).toLocaleString('en-us', {
                            style: 'currency',
                            currency: account.currency
                        })}</p>
                        <p>Buying Power: {Number(account.buyingPower).toLocaleString('en-us', {
                            style: 'currency',
                            currency: account.currency
                        })}</p>
                    </div>
                ) : (
                    <p>No account data available</p>
                )
            }
            </section>

            <TradingDashboard />
        </div>
    )
}

export default Dashboard
