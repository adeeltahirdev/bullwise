import tokenStore from "./tokenStore"

const API_URL = `${import.meta.env.VITE_API_URL}/auth`

const authService = {
    async login(credentials) {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(credentials)
        })

        const result = await response.json()

        if (!response.ok) {
            throw new Error(result.message || 'Login Failed')
        }

        const { idToken, ...userData } = result.data

        tokenStore.setToken(idToken)

        return userData
    }
}

export default authService