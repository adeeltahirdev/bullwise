import { Link } from "react-router-dom"

function Login() {
    return (
        <div className="container">
            <form className="form">
                <p className="title">Log in </p>
                <p className="message">Welcome back! Login to continue. </p>  
                        
                <label>
                    <input required name="email" type="email" className="input" />
                    <span>Email</span>
                </label> 
                    
                <label>
                    <input required name="password" type="password" className="input" />
                    <span>Password</span>
                </label>
                <button className="submit">Login</button>
                <p className="signin">Don't have an account ? <Link to='/register'>Register</Link> </p>
            </form>
        </div>
        
    )
}

export default Login