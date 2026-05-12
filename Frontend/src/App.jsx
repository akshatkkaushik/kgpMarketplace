import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Marketplace from './pages/Marketplace'
import ListItem from './pages/ListItem'
import ItemDetail from './pages/ItemDetail'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import './App.css'

function App() {
  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const location = useLocation()

  // ── Lenis Smooth Scroll ──
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    lenis.on('scroll', ({ progress, scroll }) => {
      setScrollProgress(progress * 100)
      setScrolled(scroll > 50)
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [])

  // ── Scroll to top on route change ──
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  // ── Scroll Reveal (IntersectionObserver) ──
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    const els = document.querySelectorAll('.scroll-reveal')
    els.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [location.pathname])

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="app-wrapper">
          {/* Scroll Progress */}
          <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

          {/* Grain texture overlay */}
          <div className="grain-overlay" />

          <Navbar scrolled={scrolled} />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
              <Route path="/item/:itemId" element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
              <Route path="/list-item" element={
                <ProtectedRoute><ListItem /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

