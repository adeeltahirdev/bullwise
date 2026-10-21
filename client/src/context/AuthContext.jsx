import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { auth } from '../config/firebase'

const AuthContext = createContext(null)

export function AuthProvider ({children}) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

useEffect(() => {
        let unsubscribe = null
        let active = true

        async function initializeAuth() {
            try {
                await setPersistence(auth, browserLocalPersistence)

                if (!active) return

                unsubscribe = onAuthStateChanged(
                    auth,
                    (firebaseUser) => {
                        setUser(firebaseUser)
                        setLoading(false)
                    },
                    (error) => {
                        console.error('Auth state error:', error)
                        setUser(null)
                        setLoading(false)
                    }
                )
            } catch (error) {
                console.error('Auth initialization failed:', error)

                if (active) {
                    setUser(null)
                    setLoading(false)
                }
            }
        }

        initializeAuth()

        return () => {
            active = false
            unsubscribe?.()
        }
    }, [])

    const value = {
        user,
        setUser,
        loading
    }


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error(
            'useAuth must be used within an AuthProvider'
        )
    }

    return context
}