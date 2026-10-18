
function Login() {
    return (
        <div className="container">
            <form className="form">
                <label htmlFor="email" className="label"></label>
                <input type="email" className="emailInput" id="email" />
                <label htmlFor="password" className="label"></label>
                <input type="password" className="passInput" id="password" />
                <button type="submit">Log in</button>
            </form>
        </div>
        
    )
}

export default Login