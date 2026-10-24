import { Link } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { auth } from './config/firebase'
import { signOut } from 'firebase/auth'

function App() {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <main className="landing-loading">
                <p>Loading Bullwise...</p>
            </main>
        )
    }

    const handleLogout = async () => {
      try {
        await signOut(auth)
      } catch (error) {
        console.error('Failed to log out: ', error)
      }
    }

    return (
        <main className="landing-page">
            <nav className="landing-nav">
                <Link to="/" className="landing-logo">
                    Bullwise<span>.</span>
                </Link>

                <div className="landing-nav-actions">
                    {user ? (
                            <button
                                type="button"
                                className="landing-nav-button logout-btn"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="landing-signin"
                            >
                                Sign In
                            </Link>

                            <Link
                                to="/register"
                                className="landing-nav-button get-started"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            <section className="landing-hero">
                <div className="landing-content">
                    <span className="landing-badge">
                        YOUR MARKET. YOUR PRACTICE.
                    </span>

                    <h1>
                        Learn the market.
                        <br />
                        <span>Trade with confidence.</span>
                    </h1>

                    <p className="landing-description">
                        Explore stocks, practice trading strategies, and
                        track your portfolio with virtual funds. Build your
                        experience without risking real money.
                    </p>

                    <div className="landing-hero-actions">
                        {user ? (
                            <Link
                                to="/dashboard"
                                className="landing-primary-button"
                            >
                                Go to Dashboard <span>→</span>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/register"
                                    className="landing-primary-button"
                                >
                                    Start Paper Trading <span>→</span>
                                </Link>

                                <Link
                                    to="/login"
                                    className="landing-secondary-button"
                                >
                                    I already have an account
                                </Link>
                            </>
                        )}
                    </div>

                    <p className="landing-disclaimer">
                        Practice with virtual money. No real trades are placed.
                    </p>
                </div>

                <div className="landing-preview">
                    <div className="landing-preview-header">
                        <div>
                            <p className="landing-preview-label">
                                YOUR PRACTICE PORTFOLIO
                            </p>
                            <h2>Portfolio overview</h2>
                        </div>

                        <span className="landing-preview-icon">↗</span>
                    </div>

                    <div className="landing-preview-value">
                        <p>Starting virtual balance</p>
                        <h3>$100,000.00</h3>
                        <span>Virtual funds</span>
                    </div>

                    <div className="landing-preview-divider" />

                    <div className="landing-preview-stats">
                        <div>
                            <span>Explore</span>
                            <strong>Stocks</strong>
                            <p>Discover symbols</p>
                        </div>

                        <div>
                            <span>Practice</span>
                            <strong>Trading</strong>
                            <p>Buy and sell virtually</p>
                        </div>
                    </div>

                    <div className="landing-preview-footer">
                        <span className="landing-status-dot" />
                        A practice environment, built for learning
                    </div>
                </div>
            </section>

            <section className="landing-features">
                <article>
                    <span className="landing-feature-number">01</span>
                    <h3>Practice safely</h3>
                    <p>
                        Learn how buying and selling stocks works using
                        virtual funds.
                    </p>
                </article>

                <article>
                    <span className="landing-feature-number">02</span>
                    <h3>Track your portfolio</h3>
                    <p>
                        Review your holdings, portfolio allocation, and
                        simulated profit or loss.
                    </p>
                </article>

                <article>
                    <span className="landing-feature-number">03</span>
                    <h3>Build your strategy</h3>
                    <p>
                        Explore historical stock charts and maintain a
                        personal watchlist.
                    </p>
                </article>
            </section>

            <footer className="landing-footer">
                <Link to="/" className="landing-logo">
                    Bullwise<span>.</span>
                </Link>

                <p>Practice today. Learn for tomorrow.</p>

                <span>Paper trading only</span>
            </footer>
        </main>
    )
}

export default App
