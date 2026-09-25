const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import route modules
const jobsRoutes = require('./routes/jobs');
const analyzeRoutes = require('./routes/analyze');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        message: 'Skill Setu Backend API is up and running! 🚀',
        timestamp: new Date().toISOString()
    });
});

// Mount API Routes
app.use('/api/jobs', jobsRoutes);
app.use('/api/analyze', analyzeRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(` Skill Setu Server is running! 🌐`);
    console.log(` Health:  http://localhost:${PORT}/health`);
    console.log(` Jobs:    http://localhost:${PORT}/api/jobs/search`);
    console.log(` Analyze: http://localhost:${PORT}/api/analyze/skill-gap`);
    console.log(`=================================`);
});