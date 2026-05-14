const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const verifyToken = require('../middlewares/auth.js');

router.post('/signup', async (req, res) => {
    try {
        const { companyName, email, password, pin } = req.body;

        const uppercaseAsciiStart = 65;
        const letterIndex = Math.floor(Math.random() * 26);
        const letter = String.fromCharCode(uppercaseAsciiStart + letterIndex);
        const companyID = "OP-" + Math.floor(Math.random() * 9999) + "-" + letter;

        const existingUser = await userModel.findOne({ CompanyID: companyID });
        if (existingUser) {
            return res.status(400).json({ error: "Company ID already exists. Please try again." });
        }

        const hash = await bcrypt.hash(password, 10);

        const newUser = await userModel.create({ CompanyName: companyName, CompanyID: companyID, Email: email, Password: hash, AdminPin: pin });
        res.status(201).json({ message: "User created!", user: newUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({
            $or: [{ Email: email }, { CompanyID: email }]
        });

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.Password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid password" });
        }

        // Token y cookie para dejar abierta la sesión
        const token = jwt.sign({ id: user._id, companyID: user.CompanyID }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,    
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict', 
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.status(200).json({ message: "Sign in successful!", user: { email: user.Email, companyName: user.CompanyName, companyID: user.CompanyID } });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/logout', async (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: "Logged out successfully" });
});

router.post('/admin-verify', verifyToken, async (req, res) => {
    try{
        const { pin } = req.body; 
        const userId = req.user.id; 

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        if (user.AdminPin !== pin) {
            return res.status(401).json({ error: "PIN de administrador inválido" });
        }

        res.status(200).json({ message: "Admin verified successfully" });

    } catch(error){
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;