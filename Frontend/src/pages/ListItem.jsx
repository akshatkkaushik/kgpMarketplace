import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/axiosConfig'
import './ListItem.css'

const API = 'http://localhost:3000/api'

const CATEGORIES = ['Books', 'Electronics', 'Furniture', 'Clothing', 'Cycles', 'Sports', 'Miscellaneous']

const ListItem = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', category: '', price: '', negotiable: true
  })
  const [images, setImages] = useState([null, null, null, null, null])
  const [previews, setPreviews] = useState([null, null, null, null, null])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleImageChange = (index) => (e) => {
    const file = e.target.files[0]
    if (file) {
      const newImages = [...images]
      newImages[index] = file
      setImages(newImages)

      const newPreviews = [...previews]
      newPreviews[index] = URL.createObjectURL(file)
      setPreviews(newPreviews)
    }
  }

  const removeImage = (index) => {
    const newImages = [...images]
    newImages[index] = null
    setImages(newImages)

    const newPreviews = [...previews]
    if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index])
    newPreviews[index] = null
    setPreviews(newPreviews)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { name, category, price } = form
    if (!name || !category || !price || !images[0]) {
      setError('All fields including a thumbnail image are required')
      return
    }

    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('category', category)
      formData.append('price', price)
      formData.append('list_date', new Date().toISOString())
      formData.append('negotiable', form.negotiable)
      // Append all selected images (thumbnail first)
      images.forEach((img) => {
        if (img) formData.append('img_src', img)
      })

      await api.post('/item/list', formData)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to list item')
    } finally {
      setLoading(false)
    }
  }

  // Success state
  if (success) {
    return (
      <motion.div
        className="list-item-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="list-success">
          <motion.div
            className="list-success-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </motion.div>
          <h2>Item listed</h2>
          <p>Your item is now live on the marketplace.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/marketplace" className="btn btn-primary">
              View marketplace
            </Link>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setSuccess(false)
                setForm({ name: '', category: '', price: '', negotiable: true })
                setImages([null, null, null, null, null])
                setPreviews([null, null, null, null, null])
              }}
            >
              List another
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="list-item-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <h1 className="list-item-heading">List an item</h1>
      <p className="list-item-subtext">
        Upload a photo, set your price, and go live in seconds.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Image Upload */}
        <div className="list-image-upload">
          <label className="input-label">Product photos *</label>

          {/* Thumbnail — Big Box */}
          <div className={`list-image-area list-image-thumbnail ${previews[0] ? 'has-image' : ''}`}>
            {previews[0] ? (
              <>
                <img src={previews[0]} alt="Thumbnail" className="list-image-preview" />
                <button type="button" className="image-remove-btn" onClick={() => removeImage(0)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <span className="upload-text">Click to upload thumbnail</span>
                <span className="upload-hint">JPG, PNG — max 5MB</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange(0)} />
          </div>
          <p className="thumbnail-caution">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            This image will be used as the listing thumbnail and cannot be changed later.
          </p>

          {/* Additional Images — 4 Small Boxes */}
          <div className="list-image-extras">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`list-image-area list-image-small ${previews[i] ? 'has-image' : ''}`}>
                {previews[i] ? (
                  <>
                    <img src={previews[i]} alt={`Photo ${i + 1}`} className="list-image-preview" />
                    <button type="button" className="image-remove-btn" onClick={() => removeImage(i)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span className="upload-hint">Photo {i + 1}</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange(i)} />
              </div>
            ))}
          </div>
        </div>

        {/* Name */}
        <div className="form-group">
          <label className="input-label">Item name *</label>
          <input
            type="text"
            name="name"
            className="input-field"
            placeholder="e.g. Chhapra's Circuit Theory Notebook"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        {/* Category & Price */}
        <div className="form-row" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="input-label">Category *</label>
            <select
              name="category"
              className="input-field"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">Select category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="input-label">Price (₹) *</label>
            <input
              type="number"
              name="price"
              className="input-field"
              placeholder="250"
              value={form.price}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        {/* Negotiable Toggle */}
        <div className="toggle-group">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={form.negotiable}
              onChange={(e) => setForm({ ...form, negotiable: e.target.checked })}
            />
            <div className="toggle-track"></div>
            <div className="toggle-thumb"></div>
          </label>
          <span className="toggle-label">Price is negotiable</span>
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
          {loading ? 'Publishing...' : 'Publish listing'}
          {!loading && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </motion.button>
      </form>
    </motion.div>
  )
}

export default ListItem
