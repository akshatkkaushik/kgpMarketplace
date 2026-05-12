import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import './Navbar.css'

const SunIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const MoonIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

// Icon for each nav link
const navIcons = {
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  browse: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  sell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  profile: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  login: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  ),
}

const drawerVariants = {
  hidden: { x: '100%', opacity: 0.6 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
  exit:    { x: '100%', opacity: 0.6, transition: { duration: 0.3, ease: [0.4, 0, 0.6, 1] } },
}

const itemVariants = {
  hidden: { x: 24, opacity: 0 },
  visible: (i) => ({ x: 0, opacity: 1, transition: { delay: 0.06 + i * 0.07, duration: 0.32, ease: [0.16, 1, 0.3, 1] } }),
}

const Navbar = ({ scrolled }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showLogoutPopup, setShowLogoutPopup] = useState(false)
  const { isLoggedIn, logout, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  const handleLogout = () => {
    setShowLogoutPopup(false)
    setMobileOpen(false)
    logout()
  }

  const closeMobile = () => setMobileOpen(false)

  const linkVariants = {
    hover: { y: -2, transition: { duration: 0.2, ease: 'easeOut' } }
  }

  const mainLinks = [
    { to: '/',            label: 'Home',   icon: navIcons.home   },
    { to: '/marketplace', label: 'Browse', icon: navIcons.browse },
    ...(isLoggedIn ? [{ to: '/list-item', label: 'Sell', icon: navIcons.sell }] : []),
    ...(isLoggedIn ? [{ to: '/profile',   label: 'Profile', icon: navIcons.profile }] : []),
  ]

  return (
    <>
      {/* ═══════════════ MAIN NAVBAR BAR ═══════════════ */}
      <motion.nav
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link to="/" className="navbar-logo" onClick={closeMobile}>
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" stroke="#C07A56" strokeWidth="1.5" fill="none" />
            <circle cx="16" cy="16" r="6" fill="#C07A56" opacity="0.25" />
            <circle cx="16" cy="16" r="2.5" fill="#C07A56" />
          </svg>
          kgp <span className="logo-accent">marketplace</span>
        </Link>

        {/* Desktop links */}
        <ul className="navbar-links">
          {mainLinks.map(({ to, label }) => (
            <li key={to}>
              <motion.div variants={linkVariants} whileHover="hover">
                <Link to={to} className={location.pathname === to ? 'active' : ''}>
                  {label}
                </Link>
              </motion.div>
            </li>
          ))}
          {!isLoggedIn ? (
            <>
              <li>
                <motion.div variants={linkVariants} whileHover="hover">
                  <Link to="/login">Log in</Link>
                </motion.div>
              </li>
              <li>
                <Link to="/register" className="navbar-cta">Sign up</Link>
              </li>
            </>
          ) : (
            <li>
              <button className="navbar-logout" onClick={() => setShowLogoutPopup(true)}>
                Log out
              </button>
            </li>
          )}
        </ul>

        {/* Right controls: theme toggle + hamburger */}
        <div className="navbar-right-controls">
          <button
            className="navbar-theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          <button
            className={`navbar-hamburger ${mobileOpen ? 'open' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <span /><span /><span />
          </button>
        </div>
      </motion.nav>

      {/* ═══════════════ MOBILE DRAWER ═══════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={closeMobile}
            />

            {/* Drawer panel */}
            <motion.div
              className="mobile-drawer"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Drawer header */}
              <div className="drawer-header">
                <Link to="/" className="drawer-logo" onClick={closeMobile}>
                  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
                    <circle cx="16" cy="16" r="14" stroke="#C07A56" strokeWidth="1.5" fill="none" />
                    <circle cx="16" cy="16" r="6" fill="#C07A56" opacity="0.25" />
                    <circle cx="16" cy="16" r="2.5" fill="#C07A56" />
                  </svg>
                  <span>kgp <strong>market</strong></span>
                </Link>
                <button className="drawer-close" onClick={closeMobile} aria-label="Close menu">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* User greeting (if logged in) */}
              {isLoggedIn && user?.name && (
                <motion.div
                  className="drawer-user"
                  custom={0}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="drawer-user-avatar">
                    {user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <div className="drawer-user-name">{user.name}</div>
                    <div className="drawer-user-email">{user.email}</div>
                  </div>
                </motion.div>
              )}

              {/* Main nav section */}
              <div className="drawer-section">
                <span className="drawer-section-label">Navigation</span>
                <nav className="drawer-nav">
                  {mainLinks.map(({ to, label, icon }, i) => (
                    <motion.div
                      key={to}
                      custom={i + 1}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Link
                        to={to}
                        className={`drawer-link ${location.pathname === to ? 'active' : ''}`}
                        onClick={closeMobile}
                      >
                        <span className="drawer-link-icon">{icon}</span>
                        <span className="drawer-link-label">{label}</span>
                        {location.pathname === to && (
                          <span className="drawer-link-dot" />
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>

              {/* Auth section */}
              <div className="drawer-section drawer-section-auth">
                <span className="drawer-section-label">{isLoggedIn ? 'Account' : 'Get started'}</span>
                {!isLoggedIn ? (
                  <div className="drawer-auth-btns">
                    <motion.div custom={mainLinks.length + 1} variants={itemVariants} initial="hidden" animate="visible">
                      <Link to="/login" className="drawer-btn drawer-btn-ghost" onClick={closeMobile}>
                        Log in
                      </Link>
                    </motion.div>
                    <motion.div custom={mainLinks.length + 2} variants={itemVariants} initial="hidden" animate="visible">
                      <Link to="/register" className="drawer-btn drawer-btn-primary" onClick={closeMobile}>
                        Sign up free
                      </Link>
                    </motion.div>
                  </div>
                ) : (
                  <motion.div custom={mainLinks.length + 1} variants={itemVariants} initial="hidden" animate="visible">
                    <button
                      className="drawer-btn drawer-btn-logout"
                      onClick={() => { closeMobile(); setShowLogoutPopup(true) }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Log out
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Drawer footer */}
              <div className="drawer-footer">
                <span>KGP Marketplace · IIT Kharagpur</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════════ LOGOUT POPUP ═══════════════ */}
      <AnimatePresence>
        {showLogoutPopup && (
          <motion.div
            className="logout-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowLogoutPopup(false)}
          >
            <motion.div
              className="logout-popup"
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <div className="logout-popup-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <h3 className="logout-popup-title">Log out?</h3>
              <p className="logout-popup-text">Are you sure you want to sign out of your account?</p>
              <div className="logout-popup-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => setShowLogoutPopup(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm logout-popup-confirm" onClick={handleLogout}>Log out</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
