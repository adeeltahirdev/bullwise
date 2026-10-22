import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function ProtectedRoute() {
    const {user, loading, firebaseUser} = useAuth()

    if (loading) {
        return <p>Checking authentication...</p>
    }

    if (!firebaseUser) {
        return <Navigate to='/login' replace/>
    }

    if (!firebaseUser.emailVerified) {
        return <Navigate to='/verify-email' replace/>
    }

    if (!user) {
        return <p>Unable to load your profile. Please try again</p>
    }

    return <Outlet />
}

export default ProtectedRoute