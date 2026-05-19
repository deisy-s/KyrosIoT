const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');
const productsModel = require('../models/productsModel');
const verifyToken = require('../middlewares/auth.js');

router.get('/products-info', async (req, res) => {
    try {
        const products = await productsModel.find();
        res.status(200).json({ products });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;