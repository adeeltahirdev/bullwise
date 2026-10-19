import { useState } from "react"
import { Link } from "react-router-dom"

function Register () {

    const [error, setError] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

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
        }

        if (confirmPassword.trim() === '') {
            setError('Confirm your password')
            return
        }
        

        if (password !== confirmPassword) {
            setError('Password does not match!')
            return
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
                <button className="submit">Register</button>
                <p className="signin">Already have an acount ? <Link to='/login'>Signin</Link> </p>
            </form>
        </div>
        
    )
}

export default Register