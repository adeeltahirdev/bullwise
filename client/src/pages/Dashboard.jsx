import { Link } from 'react-router-dom'
import { auth } from '../config/firebase.js'

function Dashboard() {
    return (
        <div className="container">
            <section className="form">
                <p className="title">Bullwise Dashboard</p>
                <p className="message">
                    You're signed in as {auth.currentUser?.email}.
                </p>

                <Link to="/login">Return to login</Link>
            </section>
        </div>
    )
}

export default Dashboard