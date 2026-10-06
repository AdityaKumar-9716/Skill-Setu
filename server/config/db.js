// server/config/db.js
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

// Locate and load the private Firebase service account key
const serviceAccountKeyPath = path.join(__dirname, '../firebase-key.json');

let db = null;

if (fs.existsSync(serviceAccountKeyPath)) {
    const serviceAccount = require(serviceAccountKeyPath);
    
    // Initialize Firebase Admin SDK securely
    initializeApp({
        credential: cert(serviceAccount)
    });

    // Get reference to Firestore Database
    db = getFirestore();
    console.log('🔥 Firebase Firestore connection established!');
} else {
    console.warn('⚠️ WARNING: firebase-key.json not found! Firestore will be disabled locally.');
    
    // Provide a mock db object so the app doesn't crash for team members without keys
    db = {
        collection: () => ({
            doc: () => ({
                set: async () => { console.log('Mock DB: Document save skipped (No Firebase key found)'); return true; },
                get: async () => ({ data: () => ({ message: 'Mock Database connection successful!', testedAt: new Date().toISOString() }) })
            })
        })
    };
}

module.exports = db;