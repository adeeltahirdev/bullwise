
import { useMemo } from 'react'

const money = (value) =>
    Number(value).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2
    })

const colors = [
    '#2563eb',
    '#16a34a',
    '#d97706',
    '#9333ea',
    '#0891b2',
    '#dc2626',
    '#64748b',
    '#db2777'
]

function PortfolioAllocation({ portfolio }) {
    const allocation = useMemo(() => {
        const cash = Math.max(0, Number(portfolio?.cash) || 0)
        const positions = (portfolio?.positions || [])
            .filter((position) => position.marketValue != null)
            .map((position) => ({
                symbol: position.symbol,
                value: Math.max(0, Number(position.marketValue) || 0)
            }))
            .filter((position) => position.value > 0)

        const items = [
            { label: 'Cash', value: cash, color: '#64748b' },
            ...positions.map((position, index) => ({
                label: position.symbol,
                value: position.value,
                color: colors[index % colors.length]
            }))
        ].filter((item) => item.value > 0)

        const total = items.reduce((sum, item) => sum + item.value, 0)
        const accountEquity = Number(portfolio?.portfolioValue)
        const displayedTotal = Number.isFinite(accountEquity) && accountEquity >= 0 ? accountEquity : total

        let currentAngle = 0

        const segments = items.map((item) => {
            const percentage = total > 0 ? item.value / total * 100 : 0
            const start = currentAngle
            currentAngle += percentage * 3.6

            return {
                ...item,
                percentage,
                start,
                end: currentAngle
            }
        })

        const gradient = segments.length
            ? `conic-gradient(${segments.map((segment) =>
                `${segment.color} ${segment.start}deg ${segment.end}deg`
            ).join(', ')})`
            : '#e2e8f0'

        return { segments, total, gradient, displayedTotal }
    }, [portfolio])

    const hasUnpricedPositions = (portfolio?.positions || []).some(
        (position) => position.marketValue == null
    )

    return (
        <section className="allocation-panel">
            <div className="allocation-heading">
                <div>
                    <h2>Portfolio allocation</h2>
                    <p>Cash and the value of your priced holdings</p>
                </div>
                <span className="allocation-total">
                    {money(allocation.displayedTotal)}
                </span>
            </div>

            {allocation.segments.length === 0 ? (
                <p className="allocation-empty">
                    No portfolio value is available to display yet.
                </p>
            ) : (
                <div className="allocation-content">
                    <div
                        className="allocation-donut"
                        style={{ background: allocation.gradient }}
                        role="img"
                        aria-label={`Portfolio allocation totaling ${money(allocation.total)}`}
                    >
                        <div className="allocation-donut-center">
                            <span>Total value</span>
                            <strong>{money(allocation.displayedTotal)}</strong>
                        </div>
                    </div>

                    <ul className="allocation-legend">
                        {allocation.segments.map((item) => (
                            <li key={item.label}>
                                <span
                                    className="allocation-dot"
                                    style={{ background: item.color }}
                                />
                                <span className="allocation-label">
                                    {item.label}
                                </span>
                                <span className="allocation-percentage">
                                    {item.percentage.toFixed(1)}%
                                </span>
                                <span className="allocation-value">
                                    {money(item.value)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {hasUnpricedPositions && (
                <p className="allocation-note">
                    Some holdings could not be priced and are excluded from
                    this chart. Percentages use only cash and priced holdings.
                </p>
            )}
        </section>
    )
}

export default PortfolioAllocation
