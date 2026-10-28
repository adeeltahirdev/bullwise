
import { useCallback, useEffect, useState } from 'react'
import { getSnapTradeAccounts } from '../services/snaptradeService'

function SnapTradeAccounts() {
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const loadAccounts = useCallback(async () => {
        setLoading(true)
        setError('')

        try {
            const result = await getSnapTradeAccounts()
            setAccounts(Array.isArray(result) ? result : [])
        } catch (err) {
            setError(err.message || 'Could not load brokerage accounts.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadAccounts()
    }, [loadAccounts])

    if (loading) {
        return <p>Loading connected brokerage accounts...</p>
    }

    return (
        <section>
            <h2>Connected brokerage accounts</h2>

            {error && (
                <p role="alert">
                    {error}
                </p>
            )}

            {!error && accounts.length === 0 && (
                <p>No brokerage accounts found. Connect a brokerage to get started.</p>
            )}

            {accounts.length > 0 && (
                <ul>
                    {accounts.map((account) => (
                        <li key={account.id}>
                            <strong>{account.name || 'Brokerage account'}</strong>
                            {' — '}
                            {account.number
                                ? `Account ending ${String(account.number).slice(-4)}`
                                : 'Account number unavailable'}
                            {account.currency && ` (${account.currency})`}
                        </li>
                    ))}
                </ul>
            )}

            <button onClick={loadAccounts} disabled={loading}>
                Refresh accounts
            </button>
        </section>
    )
}

export default SnapTradeAccounts
