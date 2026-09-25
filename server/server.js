const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the React frontend can make requests
app.use(cors());

// Enable JSON parsing so the server understands incoming JSON data
app.use(express.json());

// Health Check Endpoint (To verify the server is running)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        message: 'Skill Setu Backend API is up and running! 🚀',
        timestamp: new Date().toISOString()
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(` Skill Setu Server is running! 🌐`);
    console.log(` URL: http://localhost:${PORT}/health`);
    console.log(`=================================`);
});