const express = require('express');
const router = express.Router();
const { runFullSkillSetuAudit } = require('../controllers/pipelineController');
const {
    analyzeSkillsHandler,
    analyzeSkillGapHandler,
    recommendCareersHandler,
    matchOpportunitiesHandler,
    analyzeProfileHandler,
    generateRoadmapHandler
} = require('../controllers/aiController');
const dbService = require('../services/dbService');
const validate = require('../middleware/validate');
const { auditRequestSchema, flexibleProfileSchema } = require('../schemas/pipelineSchema');
const aiService = require('../ai');

// ==========================================
// FIREBASE FIRESTORE DATA ENDPOINTS
// ==========================================

// 1. Firebase Firestore Status Check
// GET /api/analyze/firebase-status
router.get('/firebase-status', async (req, res, next) => {
    try {
        const status = await dbService.getDbStatus();
        res.status(200).json({
            success: true,
            database: status
        });
    } catch (error) {
        next(error);
    }
});

// 2. Retrieve Saved Roadmap by Document ID from Firestore
// GET /api/analyze/roadmap/:id
router.get('/roadmap/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const roadmap = await dbService.getRoadmap(id);
        if (!roadmap) {
            return res.status(404).json({
                success: false,
                error: `No roadmap found with Document ID: ${id}`
            });
        }
        res.status(200).json({
            success: true,
            source: 'Firebase Firestore',
            databaseId: id,
            roadmap
        });
    } catch (error) {
        next(error);
    }
});

// 3. Save / Bookmark Roadmap to Firestore
// POST /api/analyze/save-roadmap
router.post('/save-roadmap', async (req, res, next) => {
    try {
        const { userId, roadmapData } = req.body || {};
        if (!roadmapData) {
            return res.status(400).json({
                success: false,
                error: 'roadmapData is required to save to Firestore'
            });
        }
        const docId = await dbService.saveRoadmap(userId, roadmapData);
        res.status(200).json({
            success: true,
            message: 'Roadmap successfully saved to Firestore',
            databaseId: docId
        });
    } catch (error) {
        next(error);
    }
});

// 4. Save User Profile to Firestore
// POST /api/analyze/user-profile
router.post('/user-profile', async (req, res, next) => {
    try {
        const { userId, profile } = req.body || {};
        const savedId = await dbService.saveUserProfile(userId, profile || {});
        res.status(200).json({
            success: true,
            message: 'Profile saved to Firestore',
            userId: savedId
        });
    } catch (error) {
        next(error);
    }
});

// 5. Get User Profile from Firestore
// GET /api/analyze/user-profile/:id
router.get('/user-profile/:id', async (req, res, next) => {
    try {
        const profile = await dbService.getUserProfile(req.params.id);
        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            });
        }
        res.status(200).json({
            success: true,
            profile
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// AI & AUDIT PIPELINE ENDPOINTS
// ==========================================

// 6. Master Pipeline Route (SerpApi + Gemini + Firestore)
// POST /api/analyze/full-audit
router.post('/full-audit', validate(auditRequestSchema), runFullSkillSetuAudit);

// 7. AI Skill Gap Analysis
// POST /api/analyze/skill-gap
router.post('/skill-gap', validate(flexibleProfileSchema), async (req, res, next) => {
    try {
        const { targetRole = 'Software Developer' } = req.body || {};
        const gap = aiService.analyzeSkillGap(req.body, targetRole);
        const roadmapData = aiService.generateLearningRoadmap(req.body, targetRole);

        res.status(200).json({
            success: true,
            engine: "Skill Setu AI Engine (Local)",
            analysis: {
                targetRole: gap.targetRole,
                matchPercentage: gap.matchPercentage,
                readinessLevel: gap.readinessLevel,
                missingSkills: gap.breakdown.missingSkills.map((m) => m.skill),
                roadmap: roadmapData.roadmap.map((step) => ({
                    week: step.stepNumber,
                    topic: step.title,
                    actionItems: step.actionItems
                })),
                possessedSkills: gap.breakdown.possessedSkills,
                partiallyDevelopedSkills: gap.breakdown.partiallyDevelopedSkills,
                radarComparison: gap.radarComparison
            }
        });
    } catch (error) {
        next(error);
    }
});

// 8. AI Skill Analysis
// POST /api/analyze/skills
router.post('/skills', validate(flexibleProfileSchema), analyzeSkillsHandler);

// 9. AI Career Recommendation
// POST /api/analyze/career-recommendation
router.post('/career-recommendation', validate(flexibleProfileSchema), recommendCareersHandler);

// 10. AI Opportunity / Company Matching
// POST /api/analyze/opportunity-match
router.post('/opportunity-match', validate(flexibleProfileSchema), matchOpportunitiesHandler);

// 11. AI Profile / Resume Analysis
// POST /api/analyze/profile
router.post('/profile', validate(flexibleProfileSchema), analyzeProfileHandler);

// 12. AI Personalized Learning Roadmap
// POST /api/analyze/roadmap
router.post('/roadmap', validate(flexibleProfileSchema), generateRoadmapHandler);

module.exports = router;