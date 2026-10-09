const db = require('../config/db');

/**
 * Save an audit roadmap to Firestore
 */
async function saveRoadmap(userId, auditResult) {
    try {
        const cleanUserId = userId ? String(userId).trim() : null;
        // Clean docId: ensure valid Firestore doc path
        const docId = cleanUserId 
            ? `${cleanUserId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}`
            : `roadmap_${Date.now()}`;
        
        const payload = {
            userId: cleanUserId || 'anonymous',
            ...auditResult,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        await db.collection('roadmaps').doc(docId).set(payload);
        console.log(`✅ [Firestore] Successfully saved roadmap document: ${docId}`);

        return docId;
    } catch (error) {
        console.error('❌ [Firestore] Error saving roadmap:', error.message);
        return null; 
    }
}

/**
 * Fetch a saved roadmap by document ID
 */
async function getRoadmap(docId) {
    try {
        if (!docId) return null;
        const snap = await db.collection('roadmaps').doc(String(docId)).get();
        if (!snap.exists) {
            return null;
        }
        return {
            id: snap.id,
            ...snap.data()
        };
    } catch (error) {
        console.error(`❌ [Firestore] Error fetching roadmap ${docId}:`, error.message);
        throw error;
    }
}

/**
 * Save or update student profile in Firestore
 */
async function saveUserProfile(userId, profile) {
    try {
        const cleanId = String(userId || `user_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
        await db.collection('users').doc(cleanId).set({
            ...profile,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log(`✅ [Firestore] Profile updated for: ${cleanId}`);
        return cleanId;
    } catch (error) {
        console.error('❌ [Firestore] Error saving user profile:', error.message);
        return null;
    }
}

/**
 * Get student profile by ID
 */
async function getUserProfile(userId) {
    try {
        if (!userId) return null;
        const cleanId = String(userId).replace(/[^a-zA-Z0-9_-]/g, '_');
        const snap = await db.collection('users').doc(cleanId).get();
        if (!snap.exists) return null;
        return { id: snap.id, ...snap.data() };
    } catch (error) {
        console.error('❌ [Firestore] Error fetching user profile:', error.message);
        return null;
    }
}

/**
 * Check Firestore health and return connection status
 */
async function getDbStatus() {
    try {
        const pingRef = db.collection('health_check').doc('status');
        const now = new Date().toISOString();
        await pingRef.set({ lastPing: now, status: 'online' });
        return {
            connected: true,
            isConfigured: !!db.isConfigured,
            projectId: db.projectId || 'skill-setu3993',
            provider: 'Google Cloud / Firebase Firestore',
            testedAt: now
        };
    } catch (error) {
        return {
            connected: false,
            isConfigured: !!db.isConfigured,
            projectId: db.projectId || 'mock-local-db',
            error: error.message
        };
    }
}

module.exports = {
    saveRoadmap,
    getRoadmap,
    saveUserProfile,
    getUserProfile,
    getDbStatus
};
