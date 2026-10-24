
import { useEffect, useRef, useState } from 'react'
import {
    createChart,
    CandlestickSeries,
    HistogramSeries
} from 'lightweight-charts'
import tradingService from '../service/tradingService'

const ranges = ['1M', '3M', '1Y']

function StockChart({ initialSymbol = 'AAPL' }) {
    const chartContainer = useRef(null)
    const [symbol, setSymbol] = useState(initialSymbol)
    const [range, setRange] = useState('1M')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [bars, setBars] = useState([])

    useEffect(() => {
        let cancelled = false

        const loadHistory = async () => {
            setLoading(true)
            setError('')

            try {
                const result = await tradingService.getHistory(
                    symbol,
                    range
                )

                if (!cancelled) {
                    setBars(result.bars || [])
                }
            } catch (err) {
                if (!cancelled) {
                    setBars([])
                    setError(
                        err.message || 'Unable to load stock history.'
                    )
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        loadHistory()

        return () => {
            cancelled = true
        }
    }, [symbol, range])

    useEffect(() => {
        const container = chartContainer.current

        if (!container || bars.length === 0) return

        const chart = createChart(container, {
            autoSize: true,
            height: 380,
            layout: {
                background: {
                    type: 'solid',
                    color: '#ffffff'
                },
                textColor: '#475569'
            },
            grid: {
                vertLines: { color: '#eef2f7' },
                horzLines: { color: '#eef2f7' }
            },
            rightPriceScale: {
                borderColor: '#e2e8f0'
            },
            timeScale: {
                borderColor: '#e2e8f0',
                timeVisible: false
            }
        })

        const candles = chart.addSeries(CandlestickSeries, {
            upColor: '#16a34a',
            downColor: '#dc2626',
            borderUpColor: '#16a34a',
            borderDownColor: '#dc2626',
            wickUpColor: '#16a34a',
            wickDownColor: '#dc2626'
        })

        candles.setData(
            bars.map(({ time, open, high, low, close }) => ({
                time,
                open,
                high,
                low,
                close
            }))
        )

        const volume = chart.addSeries(
            HistogramSeries,
            {
                priceFormat: { type: 'volume' },
                priceScaleId: '',
                color: '#94a3b8'
            },
            1
        )

        volume.setData(
            bars.map(({ time, volume: amount, open, close }) => ({
                time,
                value: amount,
                color: close >= open
                    ? '#86cfa4'
                    : '#f0a1a1'
            }))
        )

        volume.priceScale('').applyOptions({
            scaleMargins: {
                top: 0.05,
                bottom: 0
            }
        })

        chart.panes()[1]?.setHeight(90)
        chart.timeScale().fitContent()

        return () => chart.remove()
    }, [bars])

    const handleSearch = (event) => {
        event.preventDefault()

        const input = event.currentTarget.elements.symbol.value
            .trim()
            .toUpperCase()

        if (/^[A-Z][A-Z0-9.]{0,9}$/.test(input)) {
            setSymbol(input)
        } else {
            setError('Enter a valid stock ticker.')
        }
    }

    return (
        <section className="stock-chart-panel">
            <div className="stock-chart-header">
                <div>
                    <h2>Stock Market</h2>
                    <p>Historical daily prices and trading volume</p>
                </div>

                <form onSubmit={handleSearch} className="stock-search">
                    <input
                        name="symbol"
                        defaultValue={symbol}
                        aria-label="Stock ticker"
                        maxLength={10}
                        placeholder="e.g. AAPL"
                    />
                    <button type="submit">Search</button>
                </form>
            </div>

            <div className="stock-chart-controls">
                <strong>{symbol}</strong>

                <div className="stock-range-buttons">
                    {ranges.map((item) => (
                        <button
                            key={item}
                            type="button"
                            className={range === item ? 'active' : ''}
                            aria-pressed={range === item}
                            onClick={() => setRange(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            <p className="stock-chart-disclaimer">
                Historical daily data, not live prices.
            </p>

            {loading && <p>Loading chart data...</p>}

            {error && (
                <p className="stock-chart-error" role="alert">
                    {error}
                </p>
            )}

            {!loading && !error && bars.length === 0 && (
                <p>No historical data is available for this stock.</p>
            )}

            <div
                ref={chartContainer}
                className="stock-chart-canvas"
            />

            <p className="stock-chart-attribution">
                Charts powered by{' '}
                <a
                    href="https://www.tradingview.com/"
                    target="_blank"
                    rel="noreferrer"
                >
                    TradingView
                </a>
            </p>
        </section>
    )
}

export default StockChart
