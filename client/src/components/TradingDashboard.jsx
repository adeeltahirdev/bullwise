import { useCallback, useEffect, useState } from 'react'
import tradingService from '../service/tradingService'
import StockChart from './StockChart'
import Watchlist from './Watchlist'

const money = (value) => {
    if (value == null || !Number.isFinite(Number(value))) return '—'

    return Number(value).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
    })
}

const number = (value, maximumFractionDigits = 6) =>
    Number(value).toLocaleString('en-US', { maximumFractionDigits })

function TradingDashboard() {
    const [portfolio, setPortfolio] = useState(null)
    const [orders, setOrders] = useState([])
    const [symbol, setSymbol] = useState('AAPL')
    const [side, setSide] = useState('buy')
    const [quantity, setQuantity] = useState('1')
    const [quote, setQuote] = useState(null)

    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [checkingQuote, setCheckingQuote] = useState(false)
    const [selectedSymbol, setSelectedSymbol] = useState('AAPL')

    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const loadData = useCallback(async (initial = false) => {
        setError('')

        if (initial) setLoading(true)
        else setRefreshing(true)

        try {
            const [portfolioData, orderData] = await Promise.all([
                tradingService.getPortfolio(),
                tradingService.getOrders()
            ])

            setPortfolio(portfolioData)
            setOrders(orderData)
        } catch (err) {
            setError(err.message || 'Unable to load your trading data.')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => {
        loadData(true)
    }, [loadData])

    const lookupQuote = async () => {
        const ticker = symbol.trim().toUpperCase()

        if (!ticker) {
            setError('Enter a stock symbol.')
            return
        }

        setError('')
        setMessage('')
        setCheckingQuote(true)
        setQuote(null)

        try {
            const result = await tradingService.getQuote(ticker)
            setQuote(result)
        } catch (err) {
            setError(err.message || 'Unable to retrieve the previous close.')
        } finally {
            setCheckingQuote(false)
        }
    }

    const submitOrder = async (event) => {
        event.preventDefault()
        setError('')
        setMessage('')

        const ticker = symbol.trim().toUpperCase()
        const parsedQuantity = Number(quantity)

        if (!/^[A-Z][A-Z0-9.]{0,9}$/.test(ticker)) {
            setError('Enter a valid stock symbol.')
            return
        }

        if (
            !Number.isFinite(parsedQuantity) ||
            parsedQuantity <= 0 ||
            parsedQuantity > 1000000 ||
            Math.round(parsedQuantity * 1000000) !==
                parsedQuantity * 1000000
        ) {
            setError('Quantity must be positive with at most 6 decimal places.')
            return
        }

        setSubmitting(true)

        try {
            const order = await tradingService.placeOrder({
                symbol: ticker,
                side,
                quantity: parsedQuantity
            })

            setMessage(
                `${side === 'buy' ? 'Bought' : 'Sold'} ` +
                `${number(order.quantity)} ${order.symbol} at ` +
                `${money(order.price)} per share.`
            )

            setQuote(null)

            // Refresh account and order history after the trade.
            await loadData()
        } catch (err) {
            setError(err.message || 'Unable to execute the paper order.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <section className="trading-state" aria-live="polite">
                <span className="trading-spinner" />
                <p>Loading your Bullwise portfolio...</p>
            </section>
        )
    }

    if (!portfolio) {
        return (
            <section className="trading-state">
                <h2>Portfolio unavailable</h2>
                <p className="trading-error" role="alert">
                    {error || 'Unable to load your portfolio.'}
                </p>
                <button
                    className="trading-button trading-button-primary"
                    onClick={() => loadData(true)}
                    disabled={refreshing}
                >
                    Try again
                </button>
            </section>
        )
    }

    const positions = portfolio.positions || []
    const cash = Number(portfolio.cash) || 0
    const marketValue = Number(portfolio.marketValue) || 0
    const portfolioValue = Number(portfolio.portfolioValue) || 0
    const unrealizedPL = Number(portfolio.unrealizedProfitLoss) || 0

    const pricedPositions = positions.filter(
        (position) => position.marketValue != null
    )

    return (
        <div className="trading-dashboard">
            <header className="trading-header">
                <div>
                    <p className="trading-eyebrow">YOUR ACCOUNT</p>
                    <h1>Paper Trading</h1>
                    <p className="trading-subtitle">
                        Practice trading with virtual funds.
                    </p>
                </div>

                <button
                    type="button"
                    className="trading-button trading-button-secondary"
                    onClick={() => loadData()}
                    disabled={refreshing || submitting}
                >
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </header>

            <div className="trading-notice">
                <span aria-hidden="true">ⓘ</span>
                <p>
                    Simulated trades only. Orders use the previous daily
                    closing price, not a live quote or a real market execution.
                </p>
            </div>

            {error && (
                <div className="trading-alert trading-alert-error" role="alert">
                    {error}
                </div>
            )}

            {message && (
                <div className="trading-alert trading-alert-success" role="status">
                    {message}
                </div>
            )}

            <section className="trading-summary" aria-label="Account summary">
                <article className="trading-card">
                    <p className="trading-card-label">Portfolio value</p>
                    <p className="trading-card-value">
                        {money(portfolioValue)}
                    </p>
                    <p className="trading-card-note">Cash + priced holdings</p>
                </article>

                <article className="trading-card">
                    <p className="trading-card-label">Available cash</p>
                    <p className="trading-card-value">{money(cash)}</p>
                    <p className="trading-card-note">Virtual buying funds</p>
                </article>

                <article className="trading-card">
                    <p className="trading-card-label">Invested value</p>
                    <p className="trading-card-value">
                        {money(marketValue)}
                    </p>
                    <p className="trading-card-note">
                        {positions.length} {positions.length === 1 ? 'holding' : 'holdings'}
                    </p>
                </article>

                <article className="trading-card">
                    <p className="trading-card-label">Unrealized P/L</p>
                    <p
                        className={`trading-card-value ${
                            unrealizedPL > 0
                                ? 'trading-positive'
                                : unrealizedPL < 0
                                  ? 'trading-negative'
                                  : ''
                        }`}
                    >
                        {money(unrealizedPL)}
                    </p>
                    <p className="trading-card-note">
                        Based on available previous closes
                    </p>
                </article>
            </section>

            {!portfolio.valuationComplete && (
                <div className="trading-alert trading-alert-warning">
                    Some holdings could not be priced. The displayed portfolio
                    value excludes their unpriced market value, so the total
                    may be incomplete.
                </div>
            )}

            <Watchlist onSelectSymbol={setSelectedSymbol} />

            <StockChart key={selectedSymbol} initialSymbol={selectedSymbol} />

            <section className="trading-panel" aria-labelledby="trade-heading">
                <div className="trading-section-heading">
                    <div>
                        <h2 id="trade-heading">Place an order</h2>
                        <p>Buy or sell shares using your virtual cash.</p>
                    </div>
                </div>

                <form className="trading-form" onSubmit={submitOrder}>
                    <div className="trading-field">
                        <label htmlFor="stock-symbol">Stock symbol</label>
                        <input
                            id="stock-symbol"
                            value={symbol}
                            onChange={(event) => {
                                setSymbol(event.target.value.toUpperCase())
                                setQuote(null)
                            }}
                            maxLength={10}
                            placeholder="e.g. AAPL"
                            autoComplete="off"
                            required
                        />
                    </div>

                    <div className="trading-field">
                        <label htmlFor="order-quantity">Quantity</label>
                        <input
                            id="order-quantity"
                            type="number"
                            min="0.000001"
                            max="1000000"
                            step="0.000001"
                            value={quantity}
                            onChange={(event) => setQuantity(event.target.value)}
                            required
                        />
                    </div>

                    <div className="trading-field">
                        <label htmlFor="order-side">Order type</label>
                        <select
                            id="order-side"
                            value={side}
                            onChange={(event) => setSide(event.target.value)}
                        >
                            <option value="buy">Buy</option>
                            <option value="sell">Sell</option>
                        </select>
                    </div>

                    <div className="trading-form-actions">
                        <button
                            type="button"
                            className="trading-button trading-button-secondary"
                            onClick={lookupQuote}
                            disabled={checkingQuote || submitting}
                        >
                            {checkingQuote ? 'Checking...' : 'Check price'}
                        </button>

                        <button
                            type="submit"
                            className={`trading-button ${
                                side === 'buy'
                                    ? 'trading-button-buy'
                                    : 'trading-button-sell'
                            }`}
                            disabled={submitting || checkingQuote}
                        >
                            {submitting
                                ? 'Processing...'
                                : side === 'buy'
                                  ? 'Buy shares'
                                  : 'Sell shares'}
                        </button>
                    </div>
                </form>

                {quote && (
                    <div className="trading-quote">
                        <div>
                            <p className="trading-card-label">
                                Previous daily close
                            </p>
                            <h3>{quote.symbol}</h3>
                        </div>
                        <p className="trading-quote-price">
                            {money(quote.price)}
                        </p>
                    </div>
                )}
            </section>

            <section className="trading-panel" aria-labelledby="holdings-heading">
                <div className="trading-section-heading">
                    <div>
                        <h2 id="holdings-heading">Your holdings</h2>
                        <p>Review your current virtual stock positions.</p>
                    </div>
                    <span className="trading-count">{positions.length}</span>
                </div>

                {positions.length === 0 ? (
                    <div className="trading-empty">
                        <h3>No holdings yet</h3>
                        <p>Your purchased shares will appear here.</p>
                    </div>
                ) : (
                    <div className="trading-table-wrapper">
                        <table className="trading-table">
                            <thead>
                                <tr>
                                    <th>Stock</th>
                                    <th>Shares</th>
                                    <th>Average cost</th>
                                    <th>Previous close</th>
                                    <th>Market value</th>
                                    <th>Unrealized P/L</th>
                                </tr>
                            </thead>
                            <tbody>
                                {positions.map((position) => (
                                    <tr key={position.symbol}>
                                        <td className="trading-symbol">
                                            {position.symbol}
                                        </td>
                                        <td>{number(position.quantity)}</td>
                                        <td>{money(position.averagePrice)}</td>
                                        <td>
                                            {position.currentPrice == null
                                                ? 'Unavailable'
                                                : money(position.currentPrice)}
                                        </td>
                                        <td>
                                            {position.marketValue == null
                                                ? 'Unavailable'
                                                : money(position.marketValue)}
                                        </td>
                                        <td
                                            className={
                                                position.unrealizedProfitLoss == null
                                                    ? ''
                                                    : position.unrealizedProfitLoss > 0
                                                      ? 'trading-positive'
                                                      : position.unrealizedProfitLoss < 0
                                                        ? 'trading-negative'
                                                        : ''
                                            }
                                        >
                                            {position.unrealizedProfitLoss == null
                                                ? 'Unavailable'
                                                : money(position.unrealizedProfitLoss)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="trading-panel" aria-labelledby="orders-heading">
                <div className="trading-section-heading">
                    <div>
                        <h2 id="orders-heading">Order history</h2>
                        <p>Your most recent simulated trades.</p>
                    </div>
                    <span className="trading-count">{orders.length}</span>
                </div>

                {orders.length === 0 ? (
                    <div className="trading-empty">
                        <h3>No orders yet</h3>
                        <p>Your completed simulated trades will appear here.</p>
                    </div>
                ) : (
                    <div className="trading-table-wrapper">
                        <table className="trading-table">
                            <thead>
                                <tr>
                                    <th>Date and time</th>
                                    <th>Stock</th>
                                    <th>Side</th>
                                    <th>Shares</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td>
                                            {order.createdAt
                                                ? new Date(order.createdAt).toLocaleString()
                                                : '—'}
                                        </td>
                                        <td className="trading-symbol">
                                            {order.symbol}
                                        </td>
                                        <td>
                                            <span
                                                className={`trading-side trading-side-${order.side}`}
                                            >
                                                {order.side}
                                            </span>
                                        </td>
                                        <td>{number(order.quantity)}</td>
                                        <td>{money(order.price)}</td>
                                        <td>{money(order.total)}</td>
                                        <td>{order.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {orders.length > 0 && (
                    <p className="trading-table-footer">
                        Showing up to the latest 100 orders.
                    </p>
                )}
            </section>
        </div>
    )
}

export default TradingDashboard
