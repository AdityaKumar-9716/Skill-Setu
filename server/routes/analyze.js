const express = require('express');
const router = express.Router();
const { runFullSkillSetuAudit } = require('../controllers/pipelineController');

// 1. Member 5's Direct AI Testbed
// POST /api/analyze/skill-gap
router.post('/skill-gap', async (req, res) => {
    try {
        const { studentSkills, targetRole } = req.body;

        if (!studentSkills || !targetRole) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields: studentSkills and targetRole are both required."
            });
        }

        // Member 5 hooks raw Gemini logic here
        res.status(200).json({
            success: true,
            message: "Gemini analysis endpoint ready! Awaiting Member 5 integration.",
            analysis: {
                targetRole,
                matchPercentage: 75,
                missingSkills: ["Docker", "Redis"],
                roadmap: [
                    { week: 1, topic: "Backend Core", actionItems: ["Master REST APIs", "Learn JWT"] }
                ]
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. Team Lead's Master Pipeline Route (SerpApi + Gemini)
// POST /api/analyze/full-audit
router.post('/full-audit', runFullSkillSetuAudit);

module.exports = router;