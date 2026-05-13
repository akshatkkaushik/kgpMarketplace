const express = require("express");
const cookieParser = require('cookie-parser')
const cors = require('cors')

const allowedOrigins = ['http://localhost:5173', process.env.FRONTEND_URL].filter(Boolean)
const corsOptions = {
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps, curl, or initial preflight)
        // or origins listed in allowedOrigins
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'X-Requested-With']
}


// CSRF Protection middleware
// Rejects state-changing requests that don't include our custom header.
// Browsers enforce that custom headers require a CORS preflight, so a
// malicious cross-origin site cannot forge this header.
const csrfProtection = (req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
            return res.status(403).json({ message: 'CSRF validation failed' })
        }
    }
    next()
}

const itemRouter = require('./Routes/item.route')
const authRouter = require('./Routes/auth.route')

const app = express();
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())
app.use(csrfProtection)

app.use('/api/item', itemRouter)
app.use('/api/auth', authRouter)

app.get('/', (req, res) => {
    res.send({
        message: "backend works!!"  
    })
})

module.exports = app