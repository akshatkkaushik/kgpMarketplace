import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/axiosConfig'
import './ItemDetail.css'

const ItemDetail = () => {
    const { itemId } = useParams()
    const [item, setItem] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeImg, setActiveImg] = useState(0)

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await api.get(`/item/${itemId}`)
                setItem(res.data.item)
            } catch (err) {
                setError(err.response?.data?.message || 'Item not found')
            } finally {
                setLoading(false)
            }
        }
        fetchItem()
    }, [itemId])

    if (loading) {
        return (
            <div className="itemdetail-loading">
                <div className="loading-spinner" />
            </div>
        )
    }

    if (error || !item) {
        return (
            <div className="itemdetail-error">
                <h2>{error || 'Item not found'}</h2>
                <Link to="/marketplace" className="btn btn-ghost btn-sm">← Back to browse</Link>
            </div>
        )
    }

    const seller = item.listed_by
    const images = Array.isArray(item.img_src) ? item.img_src : []
    const thumbnailIdx = images.findIndex(i => i.is_thumbnail)
    const sortedImages = thumbnailIdx > 0
        ? [images[thumbnailIdx], ...images.filter((_, i) => i !== thumbnailIdx)]
        : images

    const formatDate = (d) => {
        if (!d) return '—'
        return new Date(d).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        })
    }

    const sellerInitials = seller?.name
        ? seller.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : seller?.username?.[0]?.toUpperCase() || '?'

    return (
        <motion.div
            className="itemdetail-page"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
            <Link to="/marketplace" className="itemdetail-back">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to browse
            </Link>

            <div className="itemdetail-layout">
                {/* ═══ LEFT: GALLERY ═══ */}
                <div className="itemdetail-gallery">
                    <motion.div
                        className="gallery-main"
                        key={activeImg}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {sortedImages.length > 0 ? (
                            <img
                                src={sortedImages[activeImg]?.url}
                                alt={item.name}
                                className="gallery-main-img"
                            />
                        ) : (
                            <div className="gallery-main-placeholder">
                                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <path d="M21 15l-5-5L5 21" />
                                </svg>
                            </div>
                        )}
                    </motion.div>

                    {sortedImages.length > 1 && (
                        <div className="gallery-thumbs">
                            {sortedImages.map((img, i) => (
                                <button
                                    key={i}
                                    className={`gallery-thumb ${i === activeImg ? 'active' : ''}`}
                                    onClick={() => setActiveImg(i)}
                                >
                                    <img src={img.url} alt={`View ${i + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ═══ RIGHT: DETAILS ═══ */}
                <div className="itemdetail-info">
                    <div className="itemdetail-badges">
                        <span className="item-badge item-badge-category">{item.category}</span>
                        {item.negotiable && (
                            <span className="item-badge item-badge-negotiable">Negotiable</span>
                        )}
                        <span className={`item-badge ${item.status === 'sold' ? 'item-badge-sold' : 'item-badge-available'}`}>
                            {item.status === 'sold' ? 'Sold' : 'Available'}
                        </span>
                    </div>

                    <h1 className="itemdetail-name">{item.name}</h1>
                    <p className="itemdetail-price">₹{item.price}</p>

                    <div className="itemdetail-meta">
                        <div className="meta-row">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            Listed {formatDate(item.list_date)}
                        </div>
                    </div>

                    {/* ═══ SELLER CARD ═══ */}
                    <div className="seller-card">
                        <h3 className="seller-card-title">Listed by</h3>
                        <div className="seller-info">
                            <div className="seller-avatar">
                                {seller?.img_src ? (
                                    <img src={seller.img_src} alt={seller.name} />
                                ) : (
                                    <div className="seller-avatar-initials">{sellerInitials}</div>
                                )}
                            </div>
                            <div className="seller-details">
                                <span className="seller-name">{seller?.name || seller?.username}</span>
                                {seller?.department && (
                                    <span className="seller-dept">{seller.department}</span>
                                )}
                            </div>
                        </div>

                        <div className="seller-contact">
                            {seller?.email && (
                                <div className="contact-row">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                    <a href={`mailto:${seller.email}`}>{seller.email}</a>
                                </div>
                            )}
                            {seller?.phone && (
                                <div className="contact-row">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                    <a href={`tel:${seller.phone}`}>{seller.phone}</a>
                                </div>
                            )}
                            {seller?.hostel && (
                                <div className="contact-row">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                        <polyline points="9 22 9 12 15 12 15 22" />
                                    </svg>
                                    <span>{seller.hostel}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default ItemDetail
