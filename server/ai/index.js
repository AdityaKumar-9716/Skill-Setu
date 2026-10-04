// server/ai/index.js
/**
 * Skill Setu AI Engine Facade
 *
 * Exposes a unified, modular interface for:
 * 1. AI Skill Analysis
 * 2. AI Skill Gap Analysis
 * 3. AI Career Recommendation
 * 4. AI Opportunity / Company Matching (local demo dataset)
 * 5. AI Profile / Resume Analysis
 * 6. Personalized Learning Roadmap
 * 7. Full Audit Orchestrator
 *
 * NOTE FOR FUTURE DEVELOPERS:
 * This interface is designed with a provider-agnostic facade.
 * External AI models (such as Google Gemini or OpenAI) can be integrated
 * in future phases by swapping or enhancing the provider underneath,
 * without altering controller signatures or frontend contracts.
 */

const { analyzeSkills, extractAllSkills } = require('./skillAnalysis');
const { analyzeSkillGap } = require('./skillGapAnalysis');
const { recommendCareers } = require('./careerRecommendation');
const { matchOpportunities } = require('./opportunityMatching');
const { analyzeProfile } = require('./profileAnalysis');
const { generateLearningRoadmap } = require('./learningRoadmap');
const { CAREER_ROLES, LOCAL_DEMO_OPPORTUNITIES, normalizeSkillName } = require('./taxonomy');

/**
 * Master Audit Pipeline: Combines skill gap analysis, personalized roadmap,
 * and top opportunity matches into a single cohesive payload.
 */
function runFullAudit(studentProfile = {}, targetRoleParam, location = 'India') {
  const targetRole = targetRoleParam || studentProfile.targetRole || studentProfile.careerGoal || 'Software Developer';

  const skillAnalysis = analyzeSkills(studentProfile);
  const gapAnalysis = analyzeSkillGap(studentProfile, targetRole);
  const roadmap = generateLearningRoadmap(studentProfile, targetRole);
  const matchedOpportunities = matchOpportunities(studentProfile, { minMatchScore: 40 });

  return {
    success: true,
    engine: 'Skill Setu Local AI Engine',
    version: '1.0.0-rule-based',
    targetRole,
    location,
    timestamp: new Date().toISOString(),
    summary: {
      matchPercentage: gapAnalysis.matchPercentage,
      readinessLevel: gapAnalysis.readinessLevel,
      criticalGapsCount: gapAnalysis.breakdown.criticalGaps.length,
      highPriorityGapsCount: gapAnalysis.breakdown.highPriorityGaps.length,
      estimatedWeeksToReady: roadmap.totalWeeksEstimated
    },
    skillAnalysis,
    gapAnalysis,
    learningRoadmap: roadmap.roadmap,
    topMatchingOpportunities: matchedOpportunities.opportunities.slice(0, 3)
  };
}

module.exports = {
  analyzeSkills,
  analyzeSkillGap,
  recommendCareers,
  matchOpportunities,
  analyzeProfile,
  generateLearningRoadmap,
  runFullAudit,
  extractAllSkills,
  normalizeSkillName,
  CAREER_ROLES,
  LOCAL_DEMO_OPPORTUNITIES
};
