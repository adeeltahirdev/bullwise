import TradingDashboard from '../components/TradingDashboard.jsx'

function Dashboard() {

    return (
        <main className="container">

            <section className="paper-trading-section">
                <h2>Your Paper Trading Account</h2>
                <p className="message">
                    Practice trading with virtual funds. Your Bullwise
                    portfolio, balances, holdings, and order history are
                    managed separately for your account.
                </p>

                <TradingDashboard />
            </section>
        </main>
    )
}

export default Dashboard
