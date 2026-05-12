const express = require('express')
const { registerUser, login, getMe, updateProfile, logout, sendOtpController, verifyOtpController } = require('../controllers/auth.controller')
const router = express.Router()
const upload = require("../middlewares/multer.middleware")
const { verifyToken } = require("../middlewares/auth.middleware")

router.post('/register', upload.single("img_src"), registerUser)
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', verifyToken, getMe)
router.put('/me', verifyToken, updateProfile)
router.post('/send-otp', upload.none(), sendOtpController)
router.post('/verify-otp', upload.none(), verifyOtpController)
module.exports = router