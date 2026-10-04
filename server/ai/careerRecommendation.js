// server/ai/careerRecommendation.js
/**
 * Module 3: AI Career Recommendation
 *
 * Analyzes a student's profile (skills, interests, projects, education,
 * experience, preferred technologies) to recommend multiple suitable career paths.
 *
 * For each path:
 * - Career name
 * - Match score
 * - Why it matches (personalized rationale)
 * - Skills supporting the recommendation
 * - Skills that need improvement
 */

const { CAREER_ROLES } = require('./taxonomy');
const { extractAllSkills } = require('./skillAnalysis');

function recommendCareers(studentProfile = {}) {
  const currentSkills = extractAllSkills(studentProfile);
  const currentSkillsLower = new Set(currentSkills.map((s) => s.toLowerCase()));
  const interests = Array.isArray(studentProfile.interests)
    ? studentProfile.interests.map((i) => String(i).toLowerCase())
    : typeof studentProfile.interests === 'string'
      ? studentProfile.interests.toLowerCase().split(/[,;\n]+/).map((s) => s.trim())
      : [];

  const projects = Array.isArray(studentProfile.projects) ? studentProfile.projects : [];
  const projectTexts = projects.map((p) => `${p.title || ''} ${p.description || ''} ${p.techStack || ''}`.toLowerCase()).join(' ');

  const scores = [];

  Object.values(CAREER_ROLES).forEach((role) => {
    const core = role.coreSkills;
    const advanced = role.advancedSkills;

    // Check matching skills
    const matchingCore = core.filter((s) => currentSkillsLower.has(s.toLowerCase()));
    const matchingAdv = advanced.filter((s) => currentSkillsLower.has(s.toLowerCase()));
    const missingCore = core.filter((s) => !currentSkillsLower.has(s.toLowerCase()));

    // Skill match score component (0 - 70 points)
    const coreRatio = core.length > 0 ? matchingCore.length / core.length : 0;
    const advRatio = advanced.length > 0 ? matchingAdv.length / advanced.length : 0;
    let score = coreRatio * 55 + advRatio * 15;

    // Interest alignment component (0 - 15 points)
    const roleWords = role.name.toLowerCase().split(' ').concat(role.domain.toLowerCase().split(' '));
    const interestHit = interests.some((interest) =>
      roleWords.some((w) => interest.includes(w) || w.includes(interest))
    );
    if (interestHit) score += 15;

    // Project alignment component (0 - 15 points)
    const projectHit = roleWords.some((w) => projectTexts.includes(w));
    if (projectHit) score += 15;

    // Round score
    const finalScore = Math.min(98, Math.max(15, Math.round(score)));

    // Generate personalized "Why it matches"
    let why = '';
    const matchingSkillsList = [...matchingCore, ...matchingAdv];

    if (matchingSkillsList.length > 0) {
      why = `Your command of ${matchingSkillsList.slice(0, 3).join(', ')} directly aligns with ${role.domain} benchmarks.`;
    } else if (interestHit) {
      why = `Your expressed interest in ${interests.join(', ')} indicates strong natural affinity for this career path.`;
    } else {
      why = `Foundational software engineering concepts you know provide a viable launching pad into ${role.name}.`;
    }

    if (projectHit) {
      why += ' Your hands-on project work also shows relevant practical experience.';
    }

    scores.push({
      careerName: role.name,
      domain: role.domain,
      matchScore: finalScore,
      salaryRange: role.entrySalaryRange,
      whyItMatches: why,
      supportingSkills: matchingSkillsList.length > 0 ? matchingSkillsList : ['General programming logic'],
      skillsToImprove: missingCore.slice(0, 4),
      sampleProjectsToBuild: role.recommendedProjects.slice(0, 2)
    });
  });

  // Sort descending by match score
  scores.sort((a, b) => b.matchScore - a.matchScore);

  // Return top 3-4 suitable paths
  const topRecommendations = scores.slice(0, 4);

  return {
    success: true,
    totalCareersEvaluated: Object.keys(CAREER_ROLES).length,
    topMatch: topRecommendations[0]?.careerName || 'Software Developer',
    recommendations: topRecommendations
  };
}

module.exports = {
  recommendCareers
};
