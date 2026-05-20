const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./db');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const verifyToken = require('./middlewares/auth.js');
const authRoutes = require('./routes/authRoutes');
const sectorRoutes = require('./routes/sectorRoutes.js');
const moduleRoutes = require('./routes/moduleRoutes.js');
const iotRoutes = require('./routes/iotRoutes.js');
const productsRoutes = require('./routes/productsRoutes.js');
const notifsRoutes = require('./routes/notifsRoutes.js');

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGIN || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`Cliente web conectado al WebSocket: ${socket.id}`);
});

app.set('socketio', io);

app.use(cors());
app.use(express.json());
app.use(cookieParser());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/sectors', sectorRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/notifs', notifsRoutes);

//app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
server.listen(PORT, () => console.log(`Servidor KYROS y Socket.io corriendo en puerto ${PORT}`));