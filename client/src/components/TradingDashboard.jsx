
import { useCallback, useEffect, useState } from 'react'
import tradingService from '../service/tradingService'

const money = (value) =>
    Number(value).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
    })

function TradingDashboard() {
    const [portfolio, setPortfolio] = useState(null)
    const [orders, setOrders] = useState([])
    const [symbol, setSymbol] = useState('AAPL')
    const [side, setSide] = useState('buy')
    const [quantity, setQuantity] = useState('1')
    const [quote, setQuote] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const loadData = useCallback(async () => {
        setError('')

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
        }
    }, [])

    useEffect(() => {
        loadData()
    }, [loadData])

    const lookupQuote = async () => {
        setError('')
        setMessage('')
        setQuote(null)

        try {
            const result = await tradingService.getQuote(symbol)
            setQuote(result)
        } catch (err) {
            setError(err.message || 'Unable to retrieve this stock price.')
        }
    }

    const submitOrder = async (event) => {
        event.preventDefault()
        setError('')
        setMessage('')

        const normalizedSymbol = symbol.trim().toUpperCase()
        const parsedQuantity = Number(quantity)

        if (!normalizedSymbol) {
            setError('Enter a stock symbol.')
            return
        }

        if (
            !Number.isFinite(parsedQuantity) ||
            parsedQuantity <= 0
        ) {
            setError('Enter a valid positive quantity.')
            return
        }

        setSubmitting(true)

        try {
            const order = await tradingService.placeOrder({
                symbol: normalizedSymbol,
                side,
                quantity: parsedQuantity
            })

            setMessage(
                `${side === 'buy' ? 'Bought' : 'Sold'} ` +
                `${order.quantity} ${order.symbol} at ` +
                `${money(order.price)} per share.`
            )

            setQuote(null)
            await loadData()
        } catch (err) {
            setError(err.message || 'Unable to execute simulated order.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <p>Loading your paper portfolio...</p>
    }

    if (!portfolio) {
        return (
            <section>
                <h2>Paper Trading</h2>
                <p role="alert">{error || 'Portfolio unavailable.'}</p>
                <button onClick={loadData}>Retry</button>
            </section>
        )
    }

    return (
        <main>
            <h1>Paper Trading</h1>
            <p>
                Simulated trading only. Prices use the latest available
                previous daily close, not live quotes.
            </p>

            {error && <p role="alert">{error}</p>}
            {message && <p role="status">{message}</p>}

            <section aria-labelledby="portfolio-heading">
                <h2 id="portfolio-heading">Your Portfolio</h2>

                <p>Available cash: {money(portfolio.cash)}</p>
                <p>Priced holdings: {money(portfolio.marketValue)}</p>
                <p>Portfolio value: {money(portfolio.portfolioValue)}</p>
                <p>
                    Unrealized profit/loss:{' '}
                    {money(portfolio.unrealizedProfitLoss)}
                </p>

                {!portfolio.valuationComplete && (
                    <p>
                        Some holdings could not be priced. The displayed
                        portfolio value excludes those unpriced holdings.
                    </p>
                )}

                <button onClick={loadData}>Refresh portfolio</button>
            </section>

            <section aria-labelledby="order-heading">
                <h2 id="order-heading">Place a Simulated Order</h2>

                <form onSubmit={submitOrder}>
                    <div>
                        <label htmlFor="stock-symbol">Stock symbol</label>
                        <input
                            id="stock-symbol"
                            value={symbol}
                            onChange={(event) => {
                                setSymbol(event.target.value.toUpperCase())
                                setQuote(null)
                            }}
                            maxLength={10}
                            required
                        />
                        <button type="button" onClick={lookupQuote}>
                            Check previous close
                        </button>
                    </div>

                    {quote && (
                        <p>
                            {quote.symbol} previous close:{' '}
                            {money(quote.price)}
                        </p>
                    )}

                    <div>
                        <label htmlFor="order-side">Order side</label>
                        <select
                            id="order-side"
                            value={side}
                            onChange={(event) => setSide(event.target.value)}
                        >
                            <option value="buy">Buy</option>
                            <option value="sell">Sell</option>
                        </select>
                    </div>

                    <div>
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

                    <button type="submit" disabled={submitting}>
                        {submitting ? 'Processing...' : 'Place paper order'}
                    </button>
                </form>
            </section>

            <section aria-labelledby="holdings-heading">
                <h2 id="holdings-heading">Holdings</h2>

                {portfolio.positions.length === 0 ? (
                    <p>You don't hold any stocks yet.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Symbol</th>
                                    <th>Quantity</th>
                                    <th>Average price</th>
                                    <th>Previous close</th>
                                    <th>Market value</th>
                                    <th>Unrealized P/L</th>
                                </tr>
                            </thead>
                            <tbody>
                                {portfolio.positions.map((position) => (
                                    <tr key={position.symbol}>
                                        <td>{position.symbol}</td>
                                        <td>{position.quantity}</td>
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
                                        <td>
                                            {position.unrealizedProfitLoss == null
                                                ? 'Unavailable'
                                                : money(
                                                    position.unrealizedProfitLoss
                                                )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section aria-labelledby="history-heading">
                <h2 id="history-heading">Recent Orders</h2>

                {orders.length === 0 ? (
                    <p>No orders placed yet.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Symbol</th>
                                    <th>Side</th>
                                    <th>Quantity</th>
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
                                                ? new Date(
                                                    order.createdAt
                                                ).toLocaleString()
                                                : '—'}
                                        </td>
                                        <td>{order.symbol}</td>
                                        <td>{order.side}</td>
                                        <td>{order.quantity}</td>
                                        <td>{money(order.price)}</td>
                                        <td>{money(order.total)}</td>
                                        <td>{order.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    )
}

export default TradingDashboard
