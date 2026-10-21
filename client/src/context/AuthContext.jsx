import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { auth } from '../config/firebase'
import profileService from '../service/profileService'

const AuthContext = createContext(null)

export function AuthProvider ({children}) {
    const [firebaseUser, setFirebaseUser] = useState(null)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)


useEffect(() => {
    let active = true
    let unsubscribe = null

    async function initializeAuth() {
        try {
            await setPersistence(auth, browserLocalPersistence)

            if (!active) return

            unsubscribe = onAuthStateChanged(
                auth,
                async (currentUser) => {
                    setFirebaseUser(currentUser)
                    setUser(null)

                    if (!currentUser) {
                        setLoading(false)
                        return
                    }

                    try {
                        const profile = await profileService.getProfile()

                        if (active) {
                            setUser(profile)
                        }
                    } catch (error) {
    if (active) {
        setUser(null)

        if (!error.message.includes('User profile not found')) {
            console.error('Failed to load profile:', error)
        }
    }
} finally {
    if (active) {
        setLoading(false)
    }
}
                },
                (error) => {
                    console.error('Auth state error:', error)

                    if (active) {
                        setFirebaseUser(null)
                        setUser(null)
                        setLoading(false)
                    }
                }
            )
        } catch (error) {
            console.error('Auth initialization failed:', error)

            if (active) {
                setFirebaseUser(null)
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

async function refreshProfile() {
    const profile = await profileService.getProfile()
    setUser(profile)
    return profile
}

const value = {
    firebaseUser,
    user,
    setUser,
    loading,
    refreshProfile
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