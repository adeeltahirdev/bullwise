import { reload, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { auth } from "../config/firebase"

function Login() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()

        setError('')

        if (!email.trim() || !password) {
            setError('Please enter your email and password')
            return
        }

        try {
            setLoading(true)

            const useCredential = await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password
            )

            const user = useCredential.user

            await reload(user)

            if (!auth.currentUser.emailVerified) {
                await signOut(auth)
                navigate('/verify-email', { replace: true })
                return
            }

            navigate('/dashboard', { replace: true })
        } catch (err) {
            console.error('Login failed:', err.code)

            const message = {
                'auth/invalid-credential':
                    'Invalid email or password.',
                'auth/user-not-found':
                    'Invalid email or password.',
                'auth/wrong-password':
                    'Invalid email or password.',
                'auth/invalid-email':
                    'Please enter a valid email address.',
                'auth/too-many-requests':
                    'Too many attempts. Please try again later.',
                'auth/user-disabled':
                    'This account has been disabled.',
            }

            setError(
                message[err.code] || 'Unable to sign in. Please try again' 
            )
        }finally {
            setLoading(false)
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

                <button className="submit" disabled={loading}>
                    {loading ? 'Signing in...' : 'log in'}
                </button>
                <p className="signin">Don't have an account ? <Link to='/register'>Register</Link> </p>
            </form>
        </div>
        
    )
}

export default Login