const db = require('../config/db');

async function saveRoadmap(userId, auditResult) {
    try {
        // We use a simple timestamp as ID if no userId is provided
        const docId = userId || `anon_${Date.now()}`;
        
        await db.collection('roadmaps').doc(docId).set({
            ...auditResult,
            createdAt: new Date().toISOString()
        });

        return docId;
    } catch (error) {
        console.error('Error saving roadmap to Firestore:', error);
        // We don't throw here to prevent crashing the response if DB fails.
        return null; 
    }
}

module.exports = { saveRoadmap };
