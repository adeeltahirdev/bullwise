
import { useEffect, useState } from 'react'
import tradingService from '../service/tradingService'

function Watchlist({ onSelectSymbol }) {
    const [symbols, setSymbols] = useState([])
    const [symbol, setSymbol] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const loadWatchlist = async () => {
        try {
            setError('')
            const result = await tradingService.getWatchlist()
            setSymbols(result.symbols || [])
        } catch (err) {
            setError(err.message || 'Unable to load watchlist.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadWatchlist()
    }, [])

    const handleAdd = async (event) => {
        event.preventDefault()

        const ticker = symbol.trim().toUpperCase()

        if (!/^[A-Z][A-Z0-9.]{0,9}$/.test(ticker)) {
            setError('Enter a valid stock ticker.')
            return
        }

        try {
            setSaving(true)
            setError('')
            const result = await tradingService.addToWatchlist(ticker)
            setSymbols(result.symbols || [])
            setSymbol('')
        } catch (err) {
            setError(err.message || 'Unable to add this stock.')
        } finally {
            setSaving(false)
        }
    }

    const handleRemove = async (ticker) => {
        try {
            setError('')
            const result =
                await tradingService.removeFromWatchlist(ticker)
            setSymbols(result.symbols || [])
        } catch (err) {
            setError(err.message || 'Unable to remove this stock.')
        }
    }

    return (
        <section className="watchlist-panel">
            <h2>My Watchlist</h2>
            <p className="watchlist-description">
                Save stocks you want to keep an eye on.
            </p>

            <form className="watchlist-form" onSubmit={handleAdd}>
                <input
                    aria-label="Stock ticker"
                    placeholder="Enter ticker, e.g. AAPL"
                    value={symbol}
                    onChange={(event) => setSymbol(event.target.value)}
                    maxLength={10}
                />
                <button type="submit" disabled={saving}>
                    {saving ? 'Adding...' : 'Add stock'}
                </button>
            </form>

            {error && (
                <p className="watchlist-error" role="alert">{error}</p>
            )}

            {loading ? (
                <p>Loading watchlist...</p>
            ) : symbols.length === 0 ? (
                <p>Your watchlist is empty. Add a stock to get started.</p>
            ) : (
                <ul className="watchlist-items">
                    {symbols.map((ticker) => (
                        <li key={ticker} className="watchlist-item">
                            <button
                                type="button"
                                className="watchlist-symbol"
                                onClick={() => onSelectSymbol?.(ticker)}
                            >
                                {ticker}
                            </button>

                            <button
                                type="button"
                                className="watchlist-remove"
                                onClick={() => handleRemove(ticker)}
                                aria-label={`Remove ${ticker}`}
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

export default Watchlist
