let idToken = null

const tokenStore = {
    getToken() {
        return idToken
    },

    setToken(token) {
        idToken = token
    },

    clearToken() {
        idToken = null
    }
}

export default tokenStore