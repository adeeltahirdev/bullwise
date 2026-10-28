import { auth } from '../config/firebase'

const API_URL = import.meta.env.VITE_API_URL

const getToken = async () => {
    const user = auth.currentUser

    if (!user) {
        throw new Error('Please sign in first.')
    }

    return user.getIdToken()
}

export const registerSnapTradeUser = async () => {
    const token = await getToken()

    const response = await fetch(`${API_URL}/trading/snaptrade/register`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const result = await response.json()

    if (!response.ok) {
        throw new Error(result.message || 'Could not register with SnapTrade.')
    }

    return result.data
}

export const createSnapTradeConnection = async () => {
    const token = await getToken()

    const response = await fetch(`${API_URL}/trading/snaptrade/connect`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const result = await response.json()

    if (!response.ok) {
        throw new Error(result.message || 'Could not start brokerage connection.')
    }

    return result.data.redirectURI
}


export const getSnapTradeAccounts = async () => {
    const token = await getToken()

    const response = await fetch(`${API_URL}/trading/snaptrade/accounts`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const result = await response.json()

    if (!response.ok) {
        throw new Error(result.message || 'Could not retrieve brokerage accounts.')
    }

    return result.data
}
