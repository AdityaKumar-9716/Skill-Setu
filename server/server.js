const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import route modules
const jobsRoutes = require('./routes/jobs');
const analyzeRoutes = require('./routes/analyze');
const errorHandler = require('./middleware/errorHandler');

// Import Firestore database connection from config/db.js
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Security Headers (Helmet)
// This patches dozens of standard Express vulnerabilities automatically.
app.use(helmet());

// 2. Strict CORS Configuration
// In production, limit this to your frontend Vercel/Netlify URL. 
// For hackathon local dev, we restrict it to localhost.
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// 3. Request Body Size Limits (Prevents large payload DoS attacks)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// 4. API Rate Limiting (Protects SerpApi and Gemini credits)
// Limits each IP to 50 requests per 15 minutes.
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 50, 
    standardHeaders: true, 
    legacyHeaders: false, 
    message: { 
        success: false, 
        error: "Too many requests from this IP, please try again after 15 minutes." 
    }
});
// Apply the rate limiter strictly to all /api/ routes
app.use('/api/', apiLimiter);

// ==========================================
// API ROUTES
// ==========================================

// Basic Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        message: 'Skill Setu Backend API is up and running securely! 🚀',
        timestamp: new Date().toISOString()
    });
});

// Test Database Connection Endpoint
app.get('/test-db', async (req, res) => {
    try {
        const testRef = db.collection('health_check').doc('ping');
        await testRef.set({
            message: 'Database connection successful!',
            testedAt: new Date().toISOString()
        });

        const doc = await testRef.get();

        res.status(200).json({
            success: true,
            message: 'Firestore read/write test passed! 🎉',
            data: typeof doc.data === 'function' ? doc.data() : doc
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

// ==========================================
// GLOBAL ERROR HANDLING (MUST BE LAST)
// ==========================================
// Catch 404s for unmatched routes
app.use((req, res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
});

// Mount Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🛡️  Skill Setu Secured Server Running!`);
    console.log(`🌐 URL: http://localhost:${PORT}/health`);
    console.log(`=================================`);
});