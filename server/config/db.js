// server/config/db.js
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

// Locate Firebase service account key across standard locations
const keyCandidatePaths = [
    process.env.FIREBASE_KEY_PATH,
    path.join(__dirname, '../firebase-key.json'),
    path.join(__dirname, '../../firebase-key.json'),
    path.join(process.cwd(), 'server/firebase-key.json'),
    path.join(process.cwd(), 'firebase-key.json')
].filter(Boolean);

let db = null;
let activeProjectId = null;
let serviceAccount = null;

// 1. Try environment variable (JSON string or base64)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        const raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
        const jsonStr = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
        serviceAccount = JSON.parse(jsonStr);
    } catch (err) {
        console.warn('⚠️ Failed to parse FIREBASE_SERVICE_ACCOUNT env var:', err.message);
    }
}

// 2. Try candidate file paths if not loaded via env
if (!serviceAccount) {
    for (const p of keyCandidatePaths) {
        try {
            if (fs.existsSync(p)) {
                serviceAccount = require(path.resolve(p));
                console.log(`🔑 Loaded Firebase key from: ${p}`);
                break;
            }
        } catch (e) {
            // continue checking other candidates
        }
    }
}

if (serviceAccount) {
    try {
        activeProjectId = serviceAccount.project_id || 'skill-setu3993';
        
        // Initialize Firebase Admin SDK securely (avoid multiple initialization)
        if (getApps().length === 0) {
            initializeApp({
                credential: cert(serviceAccount),
                projectId: activeProjectId
            });
        }

        // Get reference to Firestore Database
        db = getFirestore();
        db.projectId = activeProjectId;
        db.isConfigured = true;
        console.log(`🔥 Firebase Firestore connection established! [Project: ${activeProjectId}]`);
    } catch (err) {
        console.error('❌ Error initializing Firebase Admin SDK:', err.message);
    }
}

// If Firebase is not configured, supply mock db with clear status
if (!db) {
    console.warn('⚠️ WARNING: firebase-key.json not found! Firestore will operate in mock mode.');
    db = {
        projectId: 'mock-local-db',
        isConfigured: false,
        collection: (colName) => ({
            doc: (docId) => ({
                set: async (data) => {
                    console.log(`[Mock Firestore] Document saved in '${colName}/${docId}'`);
                    return true;
                },
                get: async () => ({
                    exists: true,
                    id: docId,
                    data: () => ({ message: 'Mock Document', collection: colName, id: docId })
                })
            })
        })
    };
}

module.exports = db;