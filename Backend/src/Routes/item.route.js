const express = require('express')
const { listProduct, getAllItems, getUserItems, markAsSold, getItemById } = require("../controllers/item.controller")
const upload = require("../middlewares/multer.middleware")
const { verifyToken } = require("../middlewares/auth.middleware")
const router = express.Router()

router.post('/list', verifyToken, upload.array("img_src", 5), listProduct)
router.get('/', getAllItems)
router.get('/user/:userId', getUserItems)
router.get('/:itemId', getItemById)
router.patch('/:itemId/sold', verifyToken, markAsSold)
module.exports = router
