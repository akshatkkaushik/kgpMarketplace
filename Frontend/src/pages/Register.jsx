import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/axiosConfig'
import { useAuth } from '../context/AuthContext'
import './Register.css'

// const API = import.meta.env.SERVER_URL

const HOSTELS = [
  'Azad Hall', 'BC Roy Hall', 'BRH Hall', 'Gokhale Hall',
  'HJB Hall', 'JCB Hall', 'LBS Hall', 'LLR Hall',
  'MMM Hall', 'MS Hall', 'Nehru Hall', 'Patel Hall',
  'RK Hall', 'RP Hall', 'SN/IG Hall', 'Vidyasagar Hall',
  'Zakir Husain Hall', 'Other'
]

const stepTransition = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
}

const Register = () => {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [showOtp, setShowOtp] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [form, setForm] = useState({
    username: '', name: '', password: '', phone: '', hostel: '', department: ''
  })
  const [profileImg, setProfileImg] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const cooldownRef = useRef(null)

  // Start a 30-second cooldown after sending OTP
  const startCooldown = () => {
    setResendCooldown(30)
    clearInterval(cooldownRef.current)
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  // Clean up timer on unmount
  useEffect(() => () => clearInterval(cooldownRef.current), [])

  // ── Step 1: Send OTP ──
  const handleSendOtp = async () => {
    if (!email) { setError('Email is required'); return }
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/send-otp', { email })
      setOtpSent(true)
      startCooldown()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 1: Resend OTP ──
  const handleResendOtp = async () => {
    setLoading(true)
    setError('')
    setOtp('')
    try {
      await api.post('/auth/send-otp', { email })
      startCooldown()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 1: Verify OTP ──
  const handleVerifyOtp = async () => {
    if (!otp) { setError('OTP is required'); return }
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/verify-otp', { email, otp })
      setOtpVerified(true)
      setTimeout(() => setStep(2), 600)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: Register ──
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileImg(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    const { username, name, password, phone, hostel, department } = form
    if (!username || !name || !password || !phone || !hostel) {
      setError('All fields are required')
      return
    }

    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('username', username)
      formData.append('name', name)
      formData.append('password', password)
      formData.append('email', email)
      formData.append('phone', phone)
      formData.append('hostel', hostel)
      if (department) formData.append('department', department)
      if (profileImg) {
        formData.append('img_src', profileImg)
      }

      await api.post('/auth/register', formData)
      await refreshUser()
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Step Indicator */}
        <div className="step-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
            {step > 1 ? '✓' : '1'}
          </div>
          <div className={`step-line ${step > 1 ? 'done' : ''}`}></div>
          <div className={`step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>
            {step > 2 ? '✓' : '2'}
          </div>
          <div className={`step-line ${step > 2 ? 'done' : ''}`}></div>
          <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        <AnimatePresence mode="wait">
          {/* ═══ STEP 1: Email Verification ═══ */}
          {step === 1 && (
            <motion.div className="step-content" key="step1" {...stepTransition}>
              <h1 className="register-heading">Verify your email</h1>
              <p className="register-subtext">
                Already have an account? <Link to="/login">Log in</Link>
              </p>

              <div className="form-group">
                <label className="input-label">Email address</label>
                <div className="otp-input-row">
                  <input
                    type="email"
                    className="input-field"
                    placeholder="your.email@iitkgp.ac.in"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError('') }}
                    disabled={otpSent}
                  />
                  {!otpSent && (
                    <motion.button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleSendOtp}
                      disabled={loading}
                      whileTap={{ scale: 0.96 }}
                    >
                      {loading ? 'Sending...' : 'Send OTP'}
                    </motion.button>
                  )}
                </div>
                {otpSent && (
                  <motion.div
                    className="otp-sent-badge"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    OTP sent to {email}
                  </motion.div>
                )}
              </div>

              {otpSent && !otpVerified && (
                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <label className="input-label">Enter OTP</label>
                  <div className="otp-input-row">
                    <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showOtp ? "text" : "password"}
                        className="input-field"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => { setOtp(e.target.value); setError('') }}
                        maxLength={6}
                        style={{ width: '100%', paddingRight: '40px' }}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowOtp(!showOtp)}
                        style={{ 
                          position: 'absolute', right: '12px', background: 'none', 
                          border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0'
                        }}
                      >
                        {showOtp ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"></path>
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        )}
                      </button>
                    </div>
                    <motion.button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleVerifyOtp}
                      disabled={loading}
                      whileTap={{ scale: 0.96 }}
                    >
                      {loading ? 'Verifying...' : 'Verify'}
                    </motion.button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <button
                      type="button"
                      className="btn-resend-otp"
                      onClick={handleResendOtp}
                      disabled={loading || resendCooldown > 0}
                    >
                      {resendCooldown > 0
                        ? `Resend OTP in ${resendCooldown}s`
                        : 'Resend OTP'}
                    </button>
                  </div>
                </motion.div>
              )}

              {otpVerified && (
                <motion.div
                  className="otp-sent-badge"
                  style={{ color: 'var(--color-success)', marginTop: '16px' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Email verified! Redirecting...
                </motion.div>
              )}

              {error && (
                <motion.div
                  className="form-error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ═══ STEP 2: Profile Details ═══ */}
          {step === 2 && (
            <motion.div className="step-content" key="step2" {...stepTransition}>
              <h1 className="register-heading">Your profile</h1>
              <p className="register-subtext">
                Fill in your details to create your account.
              </p>

              <form onSubmit={handleRegister}>
                {/* Profile image */}
                <div className="image-upload">
                  <label className="input-label">Profile photo (optional)</label>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="image-preview" />
                  ) : (
                    <div className="image-upload-area">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      <span>Click to upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">Username</label>
                    <input
                      type="text"
                      name="username"
                      className="input-field"
                      placeholder="Pick a username"
                      value={form.username}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Full name</label>
                    <input
                      type="text"
                      name="name"
                      className="input-field"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="input-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="input-field"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      className="input-field"
                      placeholder="Your phone number"
                      value={form.phone}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Hostel</label>
                    <select
                      name="hostel"
                      className="input-field"
                      value={form.hostel}
                      onChange={handleFormChange}
                    >
                      <option value="">Select hostel</option>
                      {HOSTELS.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="input-label">Department (optional)</label>
                  <input
                    type="text"
                    name="department"
                    className="input-field"
                    placeholder="e.g. Computer Science & Engineering"
                    value={form.department}
                    onChange={handleFormChange}
                  />
                </div>

                {error && (
                  <motion.div
                    className="form-error"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
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
                  {loading ? 'Creating account...' : 'Create account'}
                  {!loading && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* ═══ STEP 3: Success ═══ */}
          {step === 3 && (
            <motion.div className="step-content register-success" key="step3" {...stepTransition}>
              <motion.div
                className="success-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </motion.div>
              <h2 className="success-title">You're all set</h2>
              <p className="success-text">
                Welcome to KGP Marketplace. Start browsing or list your first item.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Link to="/marketplace" className="btn btn-primary">
                  Browse market
                </Link>
                <Link to="/list-item" className="btn btn-ghost">
                  List an item
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Register
