const express = require('express');
const router = express.Router();
const { runFullSkillSetuAudit } = require('../controllers/pipelineController');
const validate = require('../middleware/validate');
const { auditRequestSchema } = require('../schemas/pipelineSchema');

// Team Lead's Master Pipeline Route (SerpApi + Gemini + Firestore)
// POST /api/analyze/full-audit
router.post('/full-audit', validate(auditRequestSchema), runFullSkillSetuAudit);

module.exports = router;