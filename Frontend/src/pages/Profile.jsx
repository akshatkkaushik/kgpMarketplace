import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import api from '../utils/axiosConfig'
import './Profile.css'

const Profile = () => {
    const { user, refreshUser } = useAuth()
    const { theme, toggleTheme } = useTheme()

    const [items, setItems] = useState([])
    const [itemsLoading, setItemsLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [editForm, setEditForm] = useState({})
    const [editLoading, setEditLoading] = useState(false)
    const [editError, setEditError] = useState('')
    const [editSuccess, setEditSuccess] = useState(false)
    const [markingIds, setMarkingIds] = useState(new Set())

    // Populate edit form whenever user loads
    useEffect(() => {
        if (user) {
            setEditForm({
                name: user.name || '',
                phone: user.phone || '',
                hostel: user.hostel || '',
                department: user.department || ''
            })
        }
    }, [user])

    // Fetch user's items
    useEffect(() => {
        if (!user?._id) return
        setItemsLoading(true)
        api.get(`/item/user/${user._id}`)
            .then(res => setItems(res.data.items || []))
            .catch(() => setItems([]))
            .finally(() => setItemsLoading(false))
    }, [user?._id])

    const handleEditChange = (e) => {
        setEditForm(f => ({ ...f, [e.target.name]: e.target.value }))
        setEditError('')
    }

    const handleEditSave = async () => {
        setEditLoading(true)
        setEditError('')
        try {
            await api.put('/auth/me', editForm)
            await refreshUser()
            setEditing(false)
            setEditSuccess(true)
            setTimeout(() => setEditSuccess(false), 3000)
        } catch (err) {
            setEditError(err.response?.data?.message || 'Failed to update profile')
        } finally {
            setEditLoading(false)
        }
    }

    const handleMarkSold = async (itemId) => {
        setMarkingIds(prev => new Set(prev).add(itemId))
        try {
            await api.patch(`/item/${itemId}/sold`)
            setItems(prev => prev.map(item =>
                item._id === itemId ? { ...item, status: 'sold' } : item
            ))
        } catch (err) {
            console.error('Failed to mark as sold:', err)
        } finally {
            setMarkingIds(prev => {
                const next = new Set(prev)
                next.delete(itemId)
                return next
            })
        }
    }

    // Stats
    const totalItems = items.length
    const soldItems = items.filter(i => i.status === 'sold').length
    const availableItems = totalItems - soldItems

    // Initials avatar
    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : user?.username?.[0]?.toUpperCase() || '?'

    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        : null

    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const getThumbnail = (item) => {
        if (!item.img_src?.length) return null
        const thumb = item.img_src.find(i => i.is_thumbnail) || item.img_src[0]
        return thumb?.url || null
    }

    return (
        <div className="profile-page">
            {/* Background decoration */}
            <div className="profile-bg-deco" />

            <div className="profile-container">
                {/* ═══ HEADER CARD ═══ */}
                <motion.div
                    className="profile-header-card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Avatar */}
                    <div className="profile-avatar-wrap">
                        {user?.img_src ? (
                            <img src={user.img_src} alt={user.name} className="profile-avatar-img" />
                        ) : (
                            <div className="profile-avatar-initials">{initials}</div>
                        )}
                        <div className="profile-avatar-ring" />
                    </div>

                    {/* Basic info */}
                    <div className="profile-header-info">
                        <div className="profile-name-row">
                            <h1 className="profile-name">{user?.name}</h1>
                            {user?.department && (
                                <span className="profile-dept-badge">{user.department}</span>
                            )}
                        </div>
                        <p className="profile-username">@{user?.username}</p>
                        {memberSince && (
                            <p className="profile-since">Member since {memberSince}</p>
                        )}
                    </div>

                    {/* Header actions */}
                    <div className="profile-header-actions">
                        {/* Theme toggle */}
                        <button
                            id="theme-toggle"
                            className="theme-toggle"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            <span className="theme-toggle-track">
                                <span className="theme-toggle-thumb" />
                            </span>
                            <span className="theme-toggle-label">
                                {theme === 'dark' ? '🌙' : '☀️'}
                            </span>
                        </button>

                        {/* Edit button */}
                        <button
                            id="edit-profile-btn"
                            className={`btn btn-sm ${editing ? 'btn-ghost' : 'btn-ghost'}`}
                            onClick={() => { setEditing(!editing); setEditError('') }}
                        >
                            {editing ? (
                                <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                    Cancel
                                </>
                            ) : (
                                <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Edit profile
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* ═══ STATS BAR ═══ */}
                <motion.div
                    className="profile-stats"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="stat-item">
                        <span className="stat-value">{totalItems}</span>
                        <span className="stat-label">Listed</span>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat-item">
                        <span className="stat-value stat-available">{availableItems}</span>
                        <span className="stat-label">Available</span>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat-item">
                        <span className="stat-value stat-sold">{soldItems}</span>
                        <span className="stat-label">Sold</span>
                    </div>
                </motion.div>

                <div className="profile-body">
                    {/* ═══ LEFT: INFO + EDIT ═══ */}
                    <motion.div
                        className="profile-info-col"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                    >
                        <AnimatePresence mode="wait">
                            {!editing ? (
                                <motion.div
                                    key="view"
                                    className="profile-info-card"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <h2 className="card-heading">Contact & Details</h2>
                                    <div className="info-list">
                                        <div className="info-row">
                                            <span className="info-icon">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                    <polyline points="22,6 12,13 2,6" />
                                                </svg>
                                            </span>
                                            <div>
                                                <span className="info-label">Email</span>
                                                <span className="info-value">{user?.email}</span>
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-icon">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                                </svg>
                                            </span>
                                            <div>
                                                <span className="info-label">Phone</span>
                                                <span className="info-value">{user?.phone || '—'}</span>
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-icon">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                                    <polyline points="9 22 9 12 15 12 15 22" />
                                                </svg>
                                            </span>
                                            <div>
                                                <span className="info-label">Hall / Hostel</span>
                                                <span className="info-value">{user?.hostel || '—'}</span>
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-icon">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                                                </svg>
                                            </span>
                                            <div>
                                                <span className="info-label">Department</span>
                                                <span className="info-value">{user?.department || '—'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {editSuccess && (
                                        <motion.div
                                            className="edit-success-toast"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 6L9 17l-5-5" />
                                            </svg>
                                            Profile updated successfully
                                        </motion.div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="edit"
                                    className="profile-info-card"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <h2 className="card-heading">Edit Profile</h2>
                                    <p className="edit-note">Email and username cannot be changed.</p>
                                    <div className="edit-form">
                                        <div className="form-group">
                                            <label className="input-label">Full name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                className="input-field"
                                                value={editForm.name}
                                                onChange={handleEditChange}
                                                id="edit-name"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="input-label">Phone</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                className="input-field"
                                                value={editForm.phone}
                                                onChange={handleEditChange}
                                                id="edit-phone"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="input-label">Hall / Hostel</label>
                                            <input
                                                type="text"
                                                name="hostel"
                                                className="input-field"
                                                value={editForm.hostel}
                                                onChange={handleEditChange}
                                                id="edit-hostel"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="input-label">Department</label>
                                            <input
                                                type="text"
                                                name="department"
                                                className="input-field"
                                                placeholder="e.g. Computer Science & Engineering"
                                                value={editForm.department}
                                                onChange={handleEditChange}
                                                id="edit-department"
                                            />
                                        </div>

                                        {editError && (
                                            <motion.div
                                                className="form-error"
                                                initial={{ opacity: 0, y: -8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                {editError}
                                            </motion.div>
                                        )}

                                        <motion.button
                                            id="save-profile-btn"
                                            className="btn btn-primary"
                                            onClick={handleEditSave}
                                            disabled={editLoading}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            {editLoading ? 'Saving...' : 'Save changes'}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* ═══ RIGHT: LISTINGS ═══ */}
                    <motion.div
                        className="profile-listings-col"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h2 className="card-heading listings-heading">My Listings</h2>

                        {itemsLoading ? (
                            <div className="listings-loading">
                                <div className="loading-spinner" />
                            </div>
                        ) : items.length === 0 ? (
                            <div className="listings-empty">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <path d="M16 10a4 4 0 0 1-8 0" />
                                </svg>
                                <p>You haven't listed any items yet.</p>
                            </div>
                        ) : (
                            <div className="listings-grid">
                                {items.map((item, i) => (
                                    <Link
                                        key={item._id}
                                        to={`/item/${item._id}`}
                                        className="listing-card-link"
                                    >
                                    <motion.div
                                        className={`listing-card ${item.status === 'sold' ? 'listing-sold' : ''}`}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: i * 0.05 }}
                                        whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', transition: { duration: 0.2 } }}
                                    >
                                        <div className="listing-img-wrap">
                                            {getThumbnail(item) ? (
                                                <img
                                                    src={getThumbnail(item)}
                                                    alt={item.name}
                                                    className="listing-img"
                                                />
                                            ) : (
                                                <div className="listing-img-placeholder">
                                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                                        <path d="M21 15l-5-5L5 21" />
                                                    </svg>
                                                </div>
                                            )}
                                            <span className={`listing-status-badge ${item.status === 'sold' ? 'badge-sold' : 'badge-available'}`}>
                                                {item.status === 'sold' ? 'Sold' : 'Available'}
                                            </span>
                                        </div>
                                        <div className="listing-info">
                                            <div className="listing-name">{item.name}</div>
                                            <div className="listing-meta">
                                                <span className="listing-price">₹{item.price}</span>
                                                <span className="listing-category">{item.category}</span>
                                            </div>
                                            <div className="listing-date">
                                                Listed {formatDate(item.list_date)}
                                            </div>
                                            {item.status !== 'sold' && (
                                                <motion.button
                                                    id={`mark-sold-${item._id}`}
                                                    className="btn-mark-sold"
                                                    onClick={(e) => { e.preventDefault(); handleMarkSold(item._id) }}
                                                    disabled={markingIds.has(item._id)}
                                                    whileTap={{ scale: 0.96 }}
                                                >
                                                    {markingIds.has(item._id) ? (
                                                        <>
                                                            <span className="btn-spinner" />
                                                            Marking...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M20 6L9 17l-5-5" />
                                                            </svg>
                                                            Mark as sold
                                                        </>
                                                    )}
                                                </motion.button>
                                            )}
                                        </div>
                                    </motion.div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default Profile
