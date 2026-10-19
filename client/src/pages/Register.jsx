import { Link } from "react-router-dom"

function Register () {
        return (
        <div className="container">
            <form className="form">
                <p className="title">Register </p>
                <p className="message">Signup now and get full access to our app. </p>
                    <div className="flex">
                    <label>
                        <input required name="firstName" type="text" className="input" />
                        <span>Firstname</span>
                    </label>

                    <label>
                        <input required name="lastName" type="text" className="input" />
                        <span>Lastname</span>
                    </label>
                </div>  
                        
                <label>
                    <input required name="email" type="email" className="input" />
                    <span>Email</span>
                </label> 
                    
                <label>
                    <input required name="password" type="password" className="input" />
                    <span>Password</span>
                </label>
                <label>
                    <input required name="confirm-password" type="password" className="input" />
                    <span>Confirm password</span>
                </label>
                <button className="submit">Register</button>
                <p className="signin">Already have an acount ? <Link to='/login'>Signin</Link> </p>
            </form>
        </div>
        
    )
}

export default Register