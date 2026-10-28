import { useState } from 'react'
import {SnapTradeReact} from 'snaptrade-react'
import { registerSnapTradeUser, createSnapTradeConnection } from '../service/snaptradeService'

function ConnectBrokerage() {
    const [loginLink, setLoginLink] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleConnect = async () => {
        setLoading(true)
        setMessage('')

        try {
            await registerSnapTradeUser()

            const redirectURI = await createSnapTradeConnection()

            setLoginLink(redirectURI)
            setIsOpen(true)
        } catch (error) {
            setMessage(error.message || 'Unable to start connection.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section>
            <h2>Connected brokerages</h2>
            <p>Connect a supported brokerage to view its account data.</p>

            <button onClick={handleConnect} disabled={loading}>
                {loading ? 'Preparing connection…' : 'Connect brokerage'}
            </button>

            {message && <p role="alert">{message}</p>}

            {loginLink && (
                <SnapTradeReact
                    loginLink={loginLink}
                    isOpen={isOpen}
                    close={() => setIsOpen(false)}
                    onSuccess={() => {
                        setIsOpen(false)
                        setMessage('Brokerage connected. Refresh your accounts to load the latest data.')
                    }}
                />
            )}
        </section>
    )
}

export default ConnectBrokerage
