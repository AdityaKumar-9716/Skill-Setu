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
const validate = require('../middleware/validate');
const { auditRequestSchema, flexibleProfileSchema } = require('../schemas/pipelineSchema');
const aiService = require('../ai');

// 1. Member 5's AI Skill Gap Analysis
// POST /api/analyze/skill-gap
router.post('/skill-gap', validate(flexibleProfileSchema), async (req, res, next) => {
    try {
        const { studentSkills, targetRole = 'Software Developer' } = req.body || {};
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

// 2. Team Lead's Master Pipeline Route (SerpApi + AI)
// POST /api/analyze/full-audit
router.post('/full-audit', validate(auditRequestSchema), runFullSkillSetuAudit);

// 3. AI Skill Analysis
// POST /api/analyze/skills
router.post('/skills', validate(flexibleProfileSchema), analyzeSkillsHandler);

// 4. AI Career Recommendation
// POST /api/analyze/career-recommendation
router.post('/career-recommendation', validate(flexibleProfileSchema), recommendCareersHandler);

// 5. AI Opportunity / Company Matching (Local Demo Dataset)
// POST /api/analyze/opportunity-match
router.post('/opportunity-match', validate(flexibleProfileSchema), matchOpportunitiesHandler);

// 6. AI Profile / Resume Analysis
// POST /api/analyze/profile
router.post('/profile', validate(flexibleProfileSchema), analyzeProfileHandler);

// 7. AI Personalized Learning Roadmap
// POST /api/analyze/roadmap
router.post('/roadmap', validate(flexibleProfileSchema), generateRoadmapHandler);

module.exports = router;