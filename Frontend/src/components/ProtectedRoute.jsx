import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Wraps routes that require authentication.
// Shows a spinner while the /me check is in flight, then
// redirects to /login if the user is not authenticated.
const ProtectedRoute = ({ children }) => {
    const { isLoggedIn, loading } = useAuth()

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh'
            }}>
                <div className="loading-spinner" />
            </div>
        )
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />
    }

    return children
}

export default ProtectedRoute
