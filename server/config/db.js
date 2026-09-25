// server/config/db.js
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

// Locate and load the private Firebase service account key
const serviceAccountKeyPath = path.join(__dirname, '../firebase-key.json');
const serviceAccount = require(serviceAccountKeyPath);

// Initialize Firebase Admin SDK securely
initializeApp({
    credential: cert(serviceAccount)
});

// Get reference to Firestore Database
const db = getFirestore();

console.log('🔥 Firebase Firestore connection established!');

module.exports = db;