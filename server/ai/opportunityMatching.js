// server/ai/opportunityMatching.js
/**
 * Module 4: AI Opportunity / Company Matching
 *
 * Matches student profile against local demo opportunities/companies:
 * - Computes compatibility match score (0–100%)
 * - Identifies matching strengths (skills, projects, certifications)
 * - Identifies missing skills / gaps
 * - Explains why the opportunity is suitable
 *
 * NOTE: Operates strictly against the local/mock demo dataset.
 * Does NOT invoke any external APIs.
 */

const { LOCAL_DEMO_OPPORTUNITIES } = require('./taxonomy');
const { extractAllSkills } = require('./skillAnalysis');

function matchOpportunities(studentProfile = {}, options = {}) {
  const currentSkills = extractAllSkills(studentProfile);
  const currentSkillsLower = new Set(currentSkills.map((s) => s.toLowerCase()));
  const targetRole = studentProfile.targetRole || studentProfile.careerGoal || '';
  const projects = Array.isArray(studentProfile.projects) ? studentProfile.projects : [];
  const projectTexts = projects.map((p) => `${p.title || ''} ${p.techStack || ''} ${p.description || ''}`.toLowerCase()).join(' ');

  // Optional custom opportunities passed from caller, otherwise default to local demo dataset
  const opportunityPool = Array.isArray(options.opportunities) && options.opportunities.length > 0
    ? options.opportunities
    : LOCAL_DEMO_OPPORTUNITIES;

  const matches = opportunityPool.map((opp) => {
    const required = opp.requiredSkills || [];
    const preferred = opp.preferredSkills || [];

    // Evaluate matching skills
    const matchingRequired = required.filter((s) => currentSkillsLower.has(s.toLowerCase()));
    const matchingPreferred = preferred.filter((s) => currentSkillsLower.has(s.toLowerCase()));

    // Evaluate gaps
    const missingRequired = required.filter((s) => !currentSkillsLower.has(s.toLowerCase()));
    const missingPreferred = preferred.filter((s) => !currentSkillsLower.has(s.toLowerCase()));

    // Project relevancy bonus
    const oppRoleWords = (opp.role || '').toLowerCase().split(' ');
    const projectRelevance = oppRoleWords.some((w) => w.length > 2 && projectTexts.includes(w));

    // Calculate score
    const reqWeight = required.length > 0 ? (matchingRequired.length / required.length) * 70 : 50;
    const prefWeight = preferred.length > 0 ? (matchingPreferred.length / preferred.length) * 20 : 15;
    const projBonus = projectRelevance ? 10 : 0;

    let score = Math.round(reqWeight + prefWeight + projBonus);
    score = Math.min(99, Math.max(15, score));

    // Compile matching strengths
    const matchingStrengths = [...matchingRequired];
    if (projectRelevance && projects.length > 0) {
      matchingStrengths.push(`${projects[0].title || 'Technical project'} demonstrates practical implementation`);
    }
    if (matchingPreferred.length > 0) {
      matchingStrengths.push(`Preferred competency: ${matchingPreferred.join(', ')}`);
    }

    // Compile skill gaps
    const skillGaps = [...missingRequired];
    if (missingPreferred.length > 0) {
      skillGaps.push(`Bonus advantage: ${missingPreferred.slice(0, 2).join(', ')}`);
    }

    // Generate rationale
    let explanation = '';
    if (matchingRequired.length >= required.length * 0.7) {
      explanation = `Strong alignment with ${opp.company}'s core requirements in ${matchingRequired.slice(0, 2).join(' & ')}. You are well-positioned for initial screening.`;
    } else if (matchingRequired.length > 0) {
      explanation = `Good baseline match in ${matchingRequired.join(', ')}. Bridging the missing requirements (${missingRequired.slice(0, 2).join(', ')}) will significantly elevate your profile.`;
    } else {
      explanation = `Entry opportunity providing a potential growth trajectory into ${opp.role}, but key foundations in ${missingRequired.slice(0, 2).join(', ')} must be prioritized.`;
    }

    return {
      opportunityId: opp.id,
      company: opp.company,
      role: opp.role,
      location: opp.location,
      type: opp.type,
      experienceRequired: opp.experienceRequired,
      matchScore: score,
      matchingStrengths: matchingStrengths.length > 0 ? matchingStrengths : ['Basic technical coursework'],
      skillGaps: skillGaps.length > 0 ? skillGaps : ['No critical gaps identified'],
      explanation,
      isDemoData: true,
      dataSource: 'Skill Setu Local Demo Dataset'
    };
  });

  // Sort descending by match score
  matches.sort((a, b) => b.matchScore - a.matchScore);

  // Filter by minMatchScore if provided
  const minScore = options.minMatchScore || 0;
  const filtered = matches.filter((m) => m.matchScore >= minScore);

  return {
    success: true,
    totalOpportunitiesEvaluated: opportunityPool.length,
    matchedCount: filtered.length,
    disclaimer: 'Matching generated against Skill Setu local demo opportunity dataset for development, testing, and simulation.',
    opportunities: filtered
  };
}

module.exports = {
  matchOpportunities
};
