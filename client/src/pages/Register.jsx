import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {auth} from '../config/firebase.js'
import {createUserWithEmailAndPassword, sendEmailVerification, updateProfile} from 'firebase/auth'
import { useAuth } from "../context/AuthContext.jsx"

function Register () {

    const [loading, setLoading] = useState(false)

    const [error, setError] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const {refreshProfile} = useAuth()

    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()

        setError('')

        if (email.trim() === '') {
            setError('Email is required!')
            return
        }

        if (firstName.trim() === '') {
            setError('First name is required!')
            return
        }

        if (lastName.trim() === '') {
            setError('Last name is required!')
            return
        }

        if (password.trim() === '') {
            setError('Password is required!')
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 charachters!')
            return
        }

        if (confirmPassword.trim() === '') {
            setError('Confirm your password')
            return
        }


        if (password !== confirmPassword) {
            setError('Password does not match!')
            return
        }

        try {
            setLoading(true)


            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email.trim(),
                password
            )


            await updateProfile(userCredential.user, {
                displayName: `${firstName.trim()} ${lastName.trim()}`
            })


            await sendEmailVerification(userCredential.user)


            const token = await userCredential.user.getIdToken()


            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/profile`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        firstName: firstName.trim(),
                        lastName: lastName.trim()
                    })
                }
            )


            let data

            try {
                data = await response.json()
            } catch {
                throw new Error('The server returned an invalid response')
            }

            if (!response.ok) {
                throw new Error(data.message || 'Unable to create your user profile')
            }

            console.log('Profile created:', data.data)
            await refreshProfile()
            navigate('/verify-email')
        }
        catch (error) {
            console.error('Registration failed:', error.code)

            const message = {
                'auth/email-already-in-use': 'An account already exists with this email',
                'auth/invalid-email': 'Please enter a valid email address',
                'auth/weak-password': 'Please choose a stronger password',
                'auth/operation-not-allowed': 'Email/password registration is not enabled in Firebase',
                'auth/too-many-requests': 'Too many attempts. Please try again later'
            }

            if (error.code) {
                setError(
                    message[error.code] ||
                    'Unable to create your account. Please try again'
                )
            } else if (error.message === 'Failed to fetch') {
                setError(
                    'Could not reach the server. Your account may already exist. Please try again.'
                )
            } else {
                setError(error.message || 'Something went wrong. Please try again.')
            }
        }
        finally {
            setLoading(false)
        }


    }


        return (
        <div className="container">
            <form className="form" onSubmit={handleSubmit}>
                <p className="title">Register </p>
                <p className="message">Create Your Bullwise account. </p>
                    <div className="flex">
                    <label>
                        <input required name="firstName" type="text" className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
                        <span>Firstname</span>
                    </label>

                    <label>
                        <input required name="lastName" type="text" className="input" value={lastName} onChange={(e) => setLastName(e.target.value)}/>
                        <span>Lastname</span>
                    </label>
                </div>

                <label>
                    <input required name="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    <span>Email</span>
                </label>

                <label>
                    <input required name="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    <span>Password</span>
                </label>
                <label>
                    <input required name="confirm-password" type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                    <span>Confirm password</span>
                </label>

                {error && <p className="error-message">{error}</p>}

                <button className="submit" type="submit" disabled={loading}>
                    {loading ? 'Creating account...' : 'Register'}
                </button>
                <p className="signin">Already have an acount ? <Link to='/login'>Signin</Link> </p>
            </form>
        </div>

    )
}

export default Register
