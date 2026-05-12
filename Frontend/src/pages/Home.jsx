import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import './Home.css'

/* ═══ INTERACTIVE MARKETPLACE ILLUSTRATION ═══ */
function MarketplaceIllustration() {
  const containerRef = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Different spring configs for parallax layers
  const x1 = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { stiffness: 120, damping: 20 })
  const y1 = useSpring(useTransform(mouseY, [-0.5, 0.5], [-12, 12]), { stiffness: 120, damping: 20 })
  const x2 = useSpring(useTransform(mouseX, [-0.5, 0.5], [18, -18]), { stiffness: 100, damping: 18 })
  const y2 = useSpring(useTransform(mouseY, [-0.5, 0.5], [18, -18]), { stiffness: 100, damping: 18 })
  const x3 = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 80, damping: 16 })
  const y3 = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 80, damping: 16 })

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    show: (i) => ({
      opacity: 1, y: 0, scale: 1,
      transition: { duration: 0.6, delay: 0.5 + i * 0.15, ease: [0.16, 1, 0.3, 1] }
    })
  }

  return (
    <div
      className="hero-illustration"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background grid dots */}
      <svg className="hero-grid-dots" viewBox="0 0 400 400" fill="none">
        {[...Array(10)].map((_, row) =>
          [...Array(10)].map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={20 + col * 40}
              cy={20 + row * 40}
              r="1.5"
              fill="var(--color-border)"
              opacity="0.5"
            />
          ))
        )}
      </svg>

      {/* Layer 1: Main product card (book) */}
      <motion.div
        className="illust-card illust-card--main"
        style={{ x: x1, y: y1 }}
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="show"
        whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}
      >
        <div className="illust-card-img illust-card-img--book">
          <svg viewBox="0 0 48 48" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8h12c2.2 0 4 1.8 4 4v28c0-1.7-1.3-3-3-3H4V8z" />
            <path d="M44 8H32c-2.2 0-4 1.8-4 4v28c0-1.7 1.3-3 3-3h13V8z" />
          </svg>
        </div>
        <div className="illust-card-body">
          <span className="illust-card-name">Data Structures (Cormen)</span>
          <span className="illust-card-price">₹250</span>
        </div>
        <div className="illust-card-badge">📚 Books</div>
      </motion.div>

      {/* Layer 2: Electronics card */}
      <motion.div
        className="illust-card illust-card--secondary"
        style={{ x: x2, y: y2 }}
        custom={1}
        variants={cardVariants}
        initial="hidden"
        animate="show"
        whileHover={{ y: -6, boxShadow: '0 16px 48px rgba(0,0,0,0.1)' }}
      >
        <div className="illust-card-img illust-card-img--electronics">
          <svg viewBox="0 0 48 48" fill="none" stroke="#5B8FA8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="8" y="6" width="32" height="24" rx="2" />
            <line x1="16" y1="42" x2="32" y2="42" />
            <line x1="24" y1="30" x2="24" y2="42" />
          </svg>
        </div>
        <div className="illust-card-body">
          <span className="illust-card-name">Dell Monitor 24"</span>
          <span className="illust-card-price">₹4,500</span>
        </div>
        <div className="illust-card-badge illust-card-badge--green">Negotiable</div>
      </motion.div>

      {/* Layer 3: Cycle card */}
      <motion.div
        className="illust-card illust-card--tertiary"
        style={{ x: x3, y: y3 }}
        custom={2}
        variants={cardVariants}
        initial="hidden"
        animate="show"
        whileHover={{ y: -6, boxShadow: '0 16px 48px rgba(0,0,0,0.1)' }}
      >
        <div className="illust-card-img illust-card-img--cycle">
          <svg viewBox="0 0 48 48" fill="none" stroke="#8B7B5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="14" cy="32" r="8" />
            <circle cx="34" cy="32" r="8" />
            <path d="M14 32l6-14h8l6 14" />
            <path d="M20 18l4-6" />
          </svg>
        </div>
        <div className="illust-card-body">
          <span className="illust-card-name">Hero Sprint 26T</span>
          <span className="illust-card-price">₹3,200</span>
        </div>
        <div className="illust-card-badge">🚲 Cycles</div>
      </motion.div>

      {/* Floating interaction hints */}
      <motion.div
        className="illust-ping illust-ping--1"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
      >
        <span className="ping-dot"></span>
        <span className="ping-label">Just listed!</span>
      </motion.div>

      <motion.div
        className="illust-ping illust-ping--2"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.8, duration: 0.5 }}
      >
        <span className="ping-dot ping-dot--green"></span>
        <span className="ping-label">Sold in 2 hrs</span>
      </motion.div>

      {/* Connecting lines between cards */}
      <svg className="illust-connections" viewBox="0 0 500 500" fill="none">
        <motion.path
          d="M180 180 Q250 100 320 150"
          stroke="var(--color-border)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{ delay: 1, duration: 1.2 }}
        />
        <motion.path
          d="M150 320 Q200 280 280 350"
          stroke="var(--color-border)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{ delay: 1.3, duration: 1.2 }}
        />
      </svg>
    </div>
  )
}

/* ═══ MAIN HOME COMPONENT ═══ */
const Home = () => {
  const heroRef = useRef(null)

  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])

  const stagger = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  }

  return (
    <>
      {/* ═══ HERO — Split Layout ═══ */}
      <section className="hero" ref={heroRef}>
        <div className="hero-orb hero-orb--1"></div>
        <div className="hero-orb hero-orb--2"></div>

        {/* LEFT: Text */}
        <motion.div
          className="hero-text"
          style={{ y: heroY, opacity: heroOpacity }}
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.p className="hero-eyebrow" variants={fadeUp}>
            The trusted marketplace for IIT Kharagpur
          </motion.p>

          <motion.h1 className="hero-title" variants={fadeUp}>
            Your campus,<br />
            <span className="hero-title-accent">your marketplace.</span>
          </motion.h1>

          <motion.p className="hero-subtitle" variants={fadeUp}>
            Buy, sell, and trade with verified students.
            Safe deals, zero shipping — everything happens on campus.
          </motion.p>

          <motion.div className="hero-cta" variants={fadeUp}>
            <Link to="/marketplace" className="btn btn-primary">
              Browse listings
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/register" className="btn btn-ghost">
              Start selling
            </Link>
          </motion.div>

          <motion.div className="hero-stats" variants={fadeUp}>
            <div className="hero-stat">
              <div className="hero-stat-value">500+</div>
              <div className="hero-stat-label">Active listings</div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <div className="hero-stat-value">1.2K</div>
              <div className="hero-stat-label">Students</div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <div className="hero-stat-value">&#8377;2L+</div>
              <div className="hero-stat-label">Traded value</div>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT: Interactive Marketplace Illustration */}
        <MarketplaceIllustration />
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="features">
        <div className="features-header scroll-reveal">
          <p className="features-label">Why KGP Marketplace</p>
          <h2 className="features-title">Built for campus life</h2>
        </div>

        <div className="features-grid">
          <motion.div
            className="feature-card scroll-reveal"
            whileHover={{ y: -6, boxShadow: '0 16px 48px rgba(0,0,0,0.08)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className="feature-title">Verified students</h3>
            <p className="feature-desc">
              Every account is email-verified through institute credentials.
              Only real KGP students can buy and sell.
            </p>
          </motion.div>

          <motion.div
            className="feature-card scroll-reveal"
            whileHover={{ y: -6, boxShadow: '0 16px 48px rgba(0,0,0,0.08)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <h3 className="feature-title">Campus community</h3>
            <p className="feature-desc">
              Meet your buyer at their hostel. No shipping, no waiting.
              Every trade happens within campus walls.
            </p>
          </motion.div>

          <motion.div
            className="feature-card scroll-reveal"
            whileHover={{ y: -6, boxShadow: '0 16px 48px rgba(0,0,0,0.08)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
              </svg>
            </div>
            <h3 className="feature-title">Zero hassle</h3>
            <p className="feature-desc">
              List in seconds. Set your price, upload a photo, and you're live.
              Negotiation-friendly — your rules.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section className="cta-banner scroll-reveal">
        <div className="cta-banner-orb"></div>
        <h2 className="cta-banner-title">Ready to trade?</h2>
        <p className="cta-banner-text">
          Join hundreds of KGP students already buying and selling on campus.
          Your next great deal is one click away.
        </p>
        <Link to="/register" className="btn btn-primary" style={{ position: 'relative', zIndex: 1 }}>
          Create free account
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="footer">
        <div className="footer-brand" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span className="footer-text">&copy; 2026 KGP Marketplace — IIT Kharagpur</span>
          <span className="footer-love" style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            Made with <span style={{ color: '#e25555' }}>&hearts;</span> by Akshat K.
          </span>
        </div>
        <div className="footer-links">
          <Link to="/marketplace">Browse</Link>
          <Link to="/register">Sign up</Link>
          <Link to="/login">Log in</Link>
        </div>
      </footer>
    </>
  )
}

export default Home
