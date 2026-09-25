const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import route modules
const jobsRoutes = require('./routes/jobs');
const analyzeRoutes = require('./routes/analyze');
const errorHandler = require('./middleware/errorHandler');

// Import Firestore database connection from config/db.js
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        message: 'Skill Setu Backend API is up and running! 🚀',
        timestamp: new Date().toISOString()
    });
});

// Test Database Connection Endpoint
app.get('/test-db', async (req, res) => {
    try {
        // Write a test document to Firestore in a collection named 'health_check'
        const testRef = db.collection('health_check').doc('ping');
        await testRef.set({
            message: 'Database connection successful!',
            testedAt: new Date().toISOString()
        });

        // Read the document back from Firestore
        const doc = await testRef.get();

        res.status(200).json({
            success: true,
            message: 'Firestore read/write test passed! 🎉',
            data: doc.data()
        });
    } catch (error) {
        console.error('Database Connection Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to connect to Firestore Database',
            error: error.message
        });
    }
});

// Mount API Routes
app.use('/api/jobs', jobsRoutes);
app.use('/api/analyze', analyzeRoutes);

// Mount Global Error Handler (MUST BE LAST MIDDLEWARE)
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(` Skill Setu Server Running! 🌐`);
    console.log(` URL: http://localhost:${PORT}/health`);
    console.log(` DB Test: http://localhost:${PORT}/test-db`);
    console.log(`=================================`);
});