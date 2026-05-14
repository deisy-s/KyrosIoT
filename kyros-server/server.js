const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./db');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const verifyToken = require('./middlewares/auth.js');
const authRoutes = require('./routes/authRoutes');
const sectorRoutes = require('./routes/sectorRoutes.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/sectors', sectorRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));