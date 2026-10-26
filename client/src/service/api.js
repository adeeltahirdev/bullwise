
import { auth } from '../config/firebase'

const API_URL = import.meta.env.VITE_API_URL

async function apiFetch(path, options = {}) {
    if (!API_URL) {
        throw new Error('Backend API url is not configured')

    }

    const currentUser = auth.currentUser

    if (!currentUser) {
        throw new Error('You must be signed in to perform this action.')
    }

    const idToken = await currentUser.getIdToken()

    const headers = new Headers(options.headers)
    headers.set('Authorization', `Bearer ${idToken}`)

    if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }

    let response

    try {
        response = await fetch(`${API_URL}${path}`, {
            ...options,
            headers
        })
    } catch {
        throw new Error('Unable to reach the server. Check your connection and tey again')
    }

    const contentType = response.headers.get('content-type') || ''

    let result = null

    if (contentType.includes('application/json')) {
        try {
            result = await response.json()
        } catch {
            throw new Error('The server returned an invalid response')
        }
    }

    if (!response.ok) {
        throw new Error(result?.message || `Request failed with status ${response.status}`)
    }

    return result
}

export default apiFetch
