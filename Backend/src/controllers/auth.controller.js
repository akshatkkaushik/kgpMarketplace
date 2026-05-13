const userModel = require('../db/models/user.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { hashPassword } = require('../middlewares/hash.middleware')
const { fileUpload } = require('../services/storage.service')
const { sendOtp, verifyOtp, isEmailVerified, clearVerifiedEmail } = require('../services/otp.service')

// Cookie options — httpOnly prevents JS access (XSS protection)
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod; false on localhost
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
}

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
    )
}

// Strip password before sending user data to client
const sanitizeUser = (user) => {
    const { password, __v, ...safe } = user.toObject()
    return safe
}

const registerUser = async (req, res) => {
    try {
        const { username, password, name, email, phone, hostel, department } = req.body
        if (!username || !password || !name || !email || !phone || !hostel) {
            return res.status(401).json({ message: 'all fields are required' })
        }
        const findUser = await userModel.findOne({ $or: [{ username }, { email }] })
        if (findUser) {
            return res.status(401).json({ message: 'User already exists' })
        }
        if (!isEmailVerified(email)) {
            return res.status(403).json({ message: 'Email not verified. Please verify your email via OTP before registering.' })
        }

        // Image is optional — only upload if a file was provided
        let img_src = null
        if (req.file) {
            const response = await fileUpload(req.file.buffer)
            img_src = response.url
        }

        const hashedPassword = await hashPassword(password)
        const user = await userModel.create({ username, password: hashedPassword, name, img_src, email, phone, hostel, department })
        clearVerifiedEmail(email)

        const token = generateToken(user)
        res.cookie('token', token, cookieOptions)

        return res.status(201).json({
            user: sanitizeUser(user),
            message: 'User registered successfully'
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const login = async (req, res) => {
    try {
        const { username, email, password } = req.body
        if ((!username && !email) || !password) {
            return res.status(400).json({ message: 'Username or email, and password are required' })
        }
        const query = username ? { username } : { email }
        const user = await userModel.findOne(query)
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' })
        }
        const token = generateToken(user)
        res.cookie('token', token, cookieOptions)

        return res.status(200).json({
            user: sanitizeUser(user),
            message: 'Login successful'
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Returns the currently authenticated user (verifyToken middleware must run first)
const getMe = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id).select('-password -__v')
        if (!user) return res.status(404).json({ message: 'User not found' })
        return res.status(200).json({ user })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Update editable profile fields (name, phone, hostel, department only)
const updateProfile = async (req, res) => {
    try {
        const { name, phone, hostel, department } = req.body
        const user = await userModel.findByIdAndUpdate(
            req.user.id,
            { name, phone, hostel, department },
            { new: true, runValidators: true }
        ).select('-password -__v')
        if (!user) return res.status(404).json({ message: 'User not found' })
        return res.status(200).json({ user, message: 'Profile updated successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Clear the auth cookie
const logout = (req, res) => {
    res.clearCookie('token', cookieOptions)
    return res.status(200).json({ message: 'Logged out successfully' })
}

const sendOtpController = async (req, res) => {
    try {
        const email = req.body.email
        if (!email) {
            return res.status(400).json({ message: 'Email is required' })
        }
        const allowedDomain = ["iitkgp.ac.in"]
        const fullDomain = email.split("@")[1]
        const domainParts = fullDomain.split(".")
        const [part1, ...remParts] = domainParts
        const mainDomain = remParts.join(".")
        if (!allowedDomain.includes(mainDomain)) {
            return res.status(400).json({ message: 'Please use your official email id ' })
        }

        const exists = await userModel.findOne({ email })
        if (exists) {
            return res.status(400).json({ message: 'Email already exists' })
        }

        await sendOtp(email)
        return res.status(200).json({ message: 'OTP sent successfully to ' + email })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: 'Failed to send OTP: ' + error.message })
    }
}

const verifyOtpController = async (req, res) => {
    try {
        const { email, otp } = req.body
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' })
        }
        const result = verifyOtp(email, otp)
        if (!result.success) {
            return res.status(400).json({ message: result.message })
        }
        return res.status(200).json({ message: result.message, verified: true })
    } catch (error) {
        res.status(500).json({ message: 'OTP verification failed: ' + error.message })
    }
}

module.exports = { registerUser, login, getMe, updateProfile, logout, sendOtpController, verifyOtpController }

