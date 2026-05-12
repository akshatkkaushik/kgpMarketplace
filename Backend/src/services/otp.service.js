const nodemailer = require('nodemailer')

// In-memory OTP store: { email: { otp, expiresAt } }
const otpStore = new Map()

// Set of emails that have been successfully verified
const verifiedEmails = new Set()

const OTP_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes

// Generate a 6-digit OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}
// Create the nodemailer transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    })
}

// Send OTP email and store it
const sendOtp = async (email) => {
    const otp = generateOtp()

    // Store OTP with expiry timestamp
    otpStore.set(email, {
        otp,
        expiresAt: Date.now() + OTP_EXPIRY_MS,
    })

    const transporter = createTransporter()

    const mailOptions = {
        from: `"KGP Marketplace" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your OTP for Email Verification - KGP Marketplace',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #1a1a2e; text-align: center;">KGP Marketplace</h2>
                <p style="color: #333;">Hello,</p>
                <p style="color: #333;">Your OTP for email verification is:</p>
                <div style="text-align: center; margin: 24px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a2e; background: #f0f0f5; padding: 12px 24px; border-radius: 8px;">${otp}</span>
                </div>
                <p style="color: #666; font-size: 14px;">This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                <p style="color: #999; font-size: 12px; text-align: center;">If you did not request this, please ignore this email.</p>
            </div>
        `,
    }

    await transporter.sendMail(mailOptions)
    return true
}

// Verify the OTP entered by the user
const verifyOtp = (email, otp) => {
    const record = otpStore.get(email)

    if (!record) {
        return { success: false, message: 'No OTP was sent to this email. Please request a new one.' }
    }

    if (Date.now() > record.expiresAt) {
        otpStore.delete(email)
        return { success: false, message: 'OTP has expired. Please request a new one.' }
    }

    if (record.otp !== otp) {
        return { success: false, message: 'Invalid OTP. Please try again.' }
    }

    // OTP matched — clean up and mark as verified
    otpStore.delete(email)
    verifiedEmails.add(email)
    return { success: true, message: 'Email verified successfully.' }
}

// Check if an email has been verified
const isEmailVerified = (email) => verifiedEmails.has(email)

// Remove email from verified set after registration
const clearVerifiedEmail = (email) => verifiedEmails.delete(email)

module.exports = { sendOtp, verifyOtp, isEmailVerified, clearVerifiedEmail }
