
import { auth } from '../config/firebase'

const API_URL = import.meta.env.VITE_API_URL

async function apiFetch(path, options = {}) {
    const user = auth.currentUser

    if (!user) {
        throw new Error('You must be signed in to perform this action.')
    }

    const idToken = await user.getIdToken()

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${idToken}`
        }
    })

    const result = await response.json()

    if (!response.ok) {
        throw new Error(result.message || 'Request failed')
    }

    return result
}

export default apiFetch
