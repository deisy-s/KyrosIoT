const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const sectorModel = require('../models/sectorModel.js');

router.post('/sectors', async (req, res) => {
    try{

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;