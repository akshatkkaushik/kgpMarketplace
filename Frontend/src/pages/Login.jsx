import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/axiosConfig'
import { useAuth } from '../context/AuthContext'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.identifier || !form.password) {
      setError('All fields are required')
      return
    }

    setLoading(true)
    try {
      const isEmail = form.identifier.includes('@')
      const body = isEmail
        ? { email: form.identifier, password: form.password }
        : { username: form.identifier, password: form.password }

      const res = await api.post('/auth/login', body)
      await refreshUser() // re-fetch user from cookie session
      navigate('/marketplace')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Decorative Left */}
      <div className="login-deco">
        <div className="login-deco-shape login-deco-shape--1"></div>
        <div className="login-deco-shape login-deco-shape--2"></div>
        <div className="login-deco-shape login-deco-shape--3"></div>
        <div className="login-deco-text">
          Welcome<br />back
        </div>
        <div className="login-deco-quote">
          <p>"The best deals happen when two KGPians meet."</p>
          <span>— KGP Marketplace</span>
        </div>
      </div>

      {/* Form Right */}
      <motion.div
        className="login-form-panel"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="login-heading">Welcome back</h1>
        <p className="login-subtext">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label">Username or email</label>
            <input
              type="text"
              name="identifier"
              className="input-field"
              placeholder="Enter your username or email"
              value={form.identifier}
              onChange={handleChange}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              name="password"
              className="input-field"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <motion.div
              className="form-error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            className="btn btn-primary form-submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
            {!loading && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

export default Login
