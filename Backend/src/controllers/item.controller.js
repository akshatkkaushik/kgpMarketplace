const itemModel = require("../db/models/item.model");
const { fileUpload } = require("../services/storage.service")

const listProduct = async (req, res) => {
    try {
        const { category, name, price, list_date, negotiable } = req.body
        const listed_by = req.user.id  // from JWT token via verifyToken middleware
        if (!category || !name || !price || !list_date || !negotiable) {
            return res.status(401).json({ message: 'all fields are required' })
        }

        // Upload each file and build the img_src array
        const img_src = await Promise.all(
            req.files.map(async (file, index) => {
                const response = await fileUpload(file.buffer)
                return {
                    url: response.url,
                    is_thumbnail: index === 0  // first image is the thumbnail
                }
            })
        )

        const item = await itemModel.create({ category, img_src, name, price, listed_by, list_date, negotiable })
        return res.status(201).json({ message: 'Item listed successfully', item })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: error.message })
    }
}

// Browse page — only shows available items, filterable by category + name search
const getAllItems = async (req, res) => {
    try {
        const { category, search } = req.query
        // Base: available items (including legacy without status field)
        const query = { $or: [{ status: 'available' }, { status: { $exists: false } }] }
        if (category && category !== 'All') {
            query.category = category
        }
        if (search && search.trim()) {
            // Case-insensitive partial match on name
            query.name = { $regex: search.trim(), $options: 'i' }
        }
        const items = await itemModel.find(query)
            .populate('listed_by', 'username')
            .sort({ list_date: -1 })  // newest first
        return res.status(200).json({ items })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: error.message })
    }
}

// Profile page — returns ALL items by user (including sold)
const getUserItems = async (req, res) => {
    try {
        const { userId } = req.params
        const items = await itemModel.find({ listed_by: userId }).sort({ list_date: -1 })
        return res.status(200).json({ items })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: error.message })
    }
}

// Mark an item as sold — only the owner can do this
const markAsSold = async (req, res) => {
    try {
        const { itemId } = req.params
        const item = await itemModel.findById(itemId)
        if (!item) return res.status(404).json({ message: 'Item not found' })
        if (item.listed_by.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this item' })
        }
        item.status = 'sold'
        await item.save()
        return res.status(200).json({ message: 'Item marked as sold', item })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: error.message })
    }
}

// Single item detail page — populates seller contact info
const getItemById = async (req, res) => {
    try {
        const item = await itemModel.findById(req.params.itemId)
            .populate('listed_by', 'username name email phone hostel img_src department')
        if (!item) return res.status(404).json({ message: 'Item not found' })
        return res.status(200).json({ item })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: error.message })
    }
}

module.exports = { listProduct, getAllItems, getUserItems, markAsSold, getItemById }
