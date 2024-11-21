const express = require('express');
const cors = require('cors');
const uploadRoutes = require('./routes/upload_routes');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/api', uploadRoutes);

module.exports = app;
