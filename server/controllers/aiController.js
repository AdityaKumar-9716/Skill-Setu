// server/controllers/aiController.js
/**
 * AI Controller
 *
 * Exposes controllers for the 6 core AI features:
 * 1. Skill Analysis
 * 2. Skill Gap Analysis
 * 3. Career Recommendation
 * 4. Opportunity / Company Matching
 * 5. Profile / Resume Analysis
 * 6. Personalized Learning Roadmap
 */

const aiService = require('../ai');

// POST /api/analyze/skills
async function analyzeSkillsHandler(req, res, next) {
  try {
    const studentProfile = req.body || {};
    const result = aiService.analyzeSkills(studentProfile);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// POST /api/analyze/skill-gap
async function analyzeSkillGapHandler(req, res, next) {
  try {
    const studentProfile = req.body || {};
    const targetRole = req.body.targetRole || req.query.role;
    const result = aiService.analyzeSkillGap(studentProfile, targetRole);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// POST /api/analyze/career-recommendation
async function recommendCareersHandler(req, res, next) {
  try {
    const studentProfile = req.body || {};
    const result = aiService.recommendCareers(studentProfile);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// POST /api/analyze/opportunity-match
async function matchOpportunitiesHandler(req, res, next) {
  try {
    const studentProfile = req.body || {};
    const options = {
      minMatchScore: req.body.minMatchScore || 0,
      opportunities: req.body.opportunities
    };
    const result = aiService.matchOpportunities(studentProfile, options);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// POST /api/analyze/profile
async function analyzeProfileHandler(req, res, next) {
  try {
    const studentProfile = req.body || {};
    const result = aiService.analyzeProfile(studentProfile);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// POST /api/analyze/roadmap
async function generateRoadmapHandler(req, res, next) {
  try {
    const studentProfile = req.body || {};
    const targetRole = req.body.targetRole || req.query.role;
    const result = aiService.generateLearningRoadmap(studentProfile, targetRole);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  analyzeSkillsHandler,
  analyzeSkillGapHandler,
  recommendCareersHandler,
  matchOpportunitiesHandler,
  analyzeProfileHandler,
  generateRoadmapHandler
};
