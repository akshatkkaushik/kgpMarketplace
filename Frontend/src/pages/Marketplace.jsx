import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/axiosConfig'
import './Marketplace.css'

const CATEGORIES = ['All', 'Books', 'Electronics', 'Furniture', 'Clothing', 'Cycles', 'Sports', 'Miscellaneous']

const Marketplace = () => {
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')   // raw input
  const [debouncedSearch, setDebouncedSearch] = useState('') // sent to backend
  const debounceTimer = useRef(null)

  // Debounce: update debouncedSearch 350ms after typing stops
  const handleSearchChange = useCallback((e) => {
    const val = e.target.value
    setSearchInput(val)
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(val.trim())
    }, 350)
  }, [])

  const clearSearch = () => {
    setSearchInput('')
    setDebouncedSearch('')
  }

  // Fetch whenever category filter OR debounced search changes
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (filter !== 'All') params.set('category', filter)
        if (debouncedSearch) params.set('search', debouncedSearch)
        const res = await api.get(`/item/?${params.toString()}`)
        setItems(res.data.items || [])
      } catch (err) {
        console.error('Failed to fetch items:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [filter, debouncedSearch])

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }
    })
  }

  const isSearchActive = debouncedSearch.length > 0

  return (
    <motion.div
      className="marketplace"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="marketplace-header">
        <div>
          <h1 className="marketplace-title">Browse listings</h1>
          <p className="marketplace-count">
            {loading ? (
              <span className="count-loading">Searching…</span>
            ) : (
              <>
                <span>{items.length}</span> {items.length === 1 ? 'item' : 'items'}
                {isSearchActive && <> for <em>"{debouncedSearch}"</em></>}
                {filter !== 'All' && <> in <em>{filter}</em></>}
              </>
            )}
          </p>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="search-bar-wrapper">
        <div className={`search-bar ${searchInput ? 'has-value' : ''}`}>
          <span className="search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            id="marketplace-search"
            type="text"
            className="search-input"
            placeholder="Search items by name…"
            value={searchInput}
            onChange={handleSearchChange}
            autoComplete="off"
          />
          <AnimatePresence>
            {searchInput && (
              <motion.button
                className="search-clear"
                onClick={clearSearch}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.15 }}
                aria-label="Clear search"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Category Filter Bar ── */}
      <div className="filter-bar">
        {CATEGORIES.map(cat => (
          <motion.button
            key={cat}
            className={`filter-chip ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
            whileTap={{ scale: 0.95 }}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="marketplace-loading">
          <div className="loading-spinner" />
          <p>{isSearchActive ? `Searching for "${searchInput}"…` : 'Loading listings…'}</p>
        </div>
      )}

      {/* ── Items Grid ── */}
      {!loading && (
        <div className="items-grid">
          {items.length === 0 ? (
            <div className="marketplace-empty">
              {isSearchActive ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <h3>No results for "{debouncedSearch}"</h3>
                  <p>Try a different search term or browse by category.</p>
                  <button className="btn btn-ghost btn-sm" onClick={clearSearch}>Clear search</button>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                  </svg>
                  <h3>Nothing here yet</h3>
                  <p>Be the first to list something on campus.</p>
                  <Link to="/list-item" className="btn btn-primary btn-sm">List an item</Link>
                </>
              )}
            </div>
          ) : (
            items.map((item, i) => (
              <Link to={`/item/${item._id}`} key={item._id} className="item-card-link">
                <motion.div
                  className="item-card"
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="show"
                  whileHover={{
                    y: -6,
                    boxShadow: '0 16px 48px rgba(0,0,0,0.08)',
                    transition: { duration: 0.3 }
                  }}
                >
                  {item.img_src ? (
                    <img src={item.img_src[0]?.url} alt={item.name} className="item-card-img" />
                  ) : (
                    <div className="item-card-noimg">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                  )}
                  <div className="item-card-body">
                    <div className="item-card-top">
                      <span className="item-card-name">{item.name}</span>
                      <span className="item-card-price">₹{item.price}</span>
                    </div>
                    <div className="item-card-meta">
                      {item.category && (
                        <span className="item-badge item-badge-category">{item.category}</span>
                      )}
                      {item.negotiable && (
                        <span className="item-badge item-badge-negotiable">Negotiable</span>
                      )}
                      <span className="item-card-date">{formatDate(item.list_date)}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))
          )}
        </div>
      )}
    </motion.div>
  )
}

export default Marketplace
