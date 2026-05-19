const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./db');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const verifyToken = require('./middlewares/auth.js');
const authRoutes = require('./routes/authRoutes');
const sectorRoutes = require('./routes/sectorRoutes.js');
const moduleRoutes = require('./routes/moduleRoutes.js');
const iotRoutes = require('./routes/iotRoutes.js');
const productsRoutes = require('./routes/productsRoutes.js');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/sectors', sectorRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/products', productsRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));