require('dotenv').config()
const app = require("./src/app");
const connectDB = require("./src/db/db")
const port = process.env.PORT || 3000

// Await DB connection before accepting requests
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`server is running on port ${port}`)
    })
}).catch(err => {
    console.error('Failed to connect to database:', err.message)
    process.exit(1)
})
