import { reload, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { auth } from "../config/firebase"
import { useAuth } from "../context/AuthContext"

function Login() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const { setUser } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        if (!email.trim() || !password) {
            setError('Please enter your email and password')
            return
        }

        try {
            setSubmitting(true)

            const credential = await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password
            )

            await reload(credential.user)

            if (!credential.user.emailVerified) {
                await signOut(auth)
                setUser(null)
                navigate('/verify-email', { replace: true })
                return
            }

            setUser(auth.currentUser)
            navigate('/dashboard', { replace: true })
        } catch (err) {
            console.error('Login failed:', err.code)

            const messages = {
                'auth/invalid-credential': 'Invalid email or password.',
                'auth/user-not-found': 'Invalid email or password.',
                'auth/wrong-password': 'Invalid email or password.',
                'auth/invalid-email': 'Please enter a valid email address.',
                'auth/too-many-requests': 'Too many attempts. Please try again later.',
                'auth/user-disabled': 'This account has been disabled.'
            }

            setError(
                messages[err.code] || 'Unable to sign in. Please try again.'
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="container">
            <form className="form" onSubmit={handleSubmit}>
                <p className="title">Log in </p>
                <p className="message">Welcome back! Login to continue. </p>  
                        
                <label>
                    <input required name="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    <span>Email</span>
                </label> 
                    
                <label>
                    <input required name="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    <span>Password</span>
                </label>

                <Link to='/forgot-password' className="forgot-link">Forgot Password?</Link>

                {error && <p className="error-message">{error}</p>}

                <button className="submit" disabled={submitting}>
                    {submitting ? 'Signing in...' : 'log in'}
                </button>
                <p className="signin">Don't have an account ? <Link to='/register'>Register</Link> </p>
            </form>
        </div>
        
    )
}

export default Login