import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/axiosConfig'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    // On mount, verify the cookie by calling /me
    useEffect(() => {
        api.get('/auth/me')
            .then(res => setUser(res.data.user))
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [])

    // Re-fetch user data (call after login/register/profile update)
    const refreshUser = useCallback(async () => {
        try {
            const res = await api.get('/auth/me')
            setUser(res.data.user)
        } catch {
            setUser(null)
        }
    }, [])

    // POST /auth/logout clears the HttpOnly cookie on the server
    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout')
        } catch {
            // continue even if the request fails
        }
        setUser(null)
        navigate('/')
    }, [navigate])

    return (
        <AuthContext.Provider value={{
            user,
            isLoggedIn: !!user,
            loading,
            refreshUser,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    )
}

// Convenience hook
export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}

export default AuthContext
