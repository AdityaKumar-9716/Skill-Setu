// server/ai/skillGapAnalysis.js
/**
 * Module 2: AI Skill Gap Analysis
 *
 * Compares student's current skills against target role requirements:
 * 1. Skills already possessed
 * 2. Skills partially developed
 * 3. Important missing skills
 * 4. Priority of missing skills (Critical, High, Medium, Market-ready)
 * 5. Recommended learning sequence
 */

const { normalizeSkillName, CAREER_ROLES } = require('./taxonomy');
const { extractAllSkills } = require('./skillAnalysis');

function analyzeSkillGap(studentProfile = {}, targetRoleParam) {
  const currentSkills = extractAllSkills(studentProfile);
  const targetRole = targetRoleParam || studentProfile.targetRole || studentProfile.careerGoal || 'Software Developer';
  const roleConfig = CAREER_ROLES[targetRole] || CAREER_ROLES['Software Developer'];

  const coreRequired = roleConfig.coreSkills;
  const advancedRequired = roleConfig.advancedSkills;
  const allRoleSkills = [...coreRequired, ...advancedRequired];

  // Map of skills in lowercase for matching
  const currentSkillsLower = new Set(currentSkills.map((s) => s.toLowerCase()));

  // Categorize
  const possessedSkills = [];
  const partiallyDevelopedSkills = [];
  const missingSkills = [];

  // Check Core Skills
  coreRequired.forEach((reqSkill) => {
    const isExact = currentSkillsLower.has(reqSkill.toLowerCase());
    if (isExact) {
      possessedSkills.push({
        skill: reqSkill,
        level: 'Core Requirement Met',
        status: 'Possessed'
      });
    } else {
      // Check partial development (e.g. has JavaScript for TypeScript, or has Python for Data Structures)
      const hasRelatedLang = (reqSkill === 'TypeScript' && currentSkillsLower.has('javascript')) ||
                            (reqSkill === 'React' && currentSkillsLower.has('javascript')) ||
                            (reqSkill === 'Pandas' && currentSkillsLower.has('python')) ||
                            (reqSkill === 'FastAPI' && currentSkillsLower.has('python')) ||
                            (reqSkill === 'Docker' && currentSkillsLower.has('linux'));

      if (hasRelatedLang) {
        partiallyDevelopedSkills.push({
          skill: reqSkill,
          level: 'Partial / Related Foundation Present',
          priority: 'High',
          action: `Build upon existing foundation to master ${reqSkill}`
        });
      } else {
        missingSkills.push({
          skill: reqSkill,
          tier: 'Core',
          priority: 'Critical',
          impact: 'Required by >85% of job openings for this role'
        });
      }
    }
  });

  // Check Advanced Skills
  advancedRequired.forEach((advSkill) => {
    const isExact = currentSkillsLower.has(advSkill.toLowerCase());
    if (isExact) {
      possessedSkills.push({
        skill: advSkill,
        level: 'Advanced Advantage Met',
        status: 'Possessed'
      });
    } else {
      missingSkills.push({
        skill: advSkill,
        tier: 'Advanced / Specialization',
        priority: 'Medium',
        impact: 'Differentiates candidates in competitive technical interviews'
      });
    }
  });

  // Calculate Match Score
  const totalCore = coreRequired.length || 1;
  const totalAdv = advancedRequired.length || 1;
  const possessedCore = possessedSkills.filter((p) => coreRequired.includes(p.skill)).length;
  const possessedAdv = possessedSkills.filter((p) => advancedRequired.includes(p.skill)).length;
  const partialCore = partiallyDevelopedSkills.length;

  // Weight: Core 75%, Advanced 25% + partial credit for related skills
  const coreScore = (possessedCore / totalCore) * 75 + (partialCore / totalCore) * 20;
  const advScore = (possessedAdv / totalAdv) * 25;
  const rawMatchScore = Math.min(100, Math.round(coreScore + advScore));

  // Determine readiness level
  let readinessLevel = 'Early Foundations';
  if (rawMatchScore >= 80) readinessLevel = 'Market Ready / Competitive';
  else if (rawMatchScore >= 60) readinessLevel = 'Strong Candidate (1–2 minor gaps)';
  else if (rawMatchScore >= 40) readinessLevel = 'Developing (2–4 weeks dedicated prep)';

  // Build structured learning sequence
  // Critical missing core skills first -> High partial skills -> Medium advanced skills
  const recommendedLearningSequence = [
    ...missingSkills.filter((m) => m.priority === 'Critical').map((m) => ({
      skill: m.skill,
      priority: 'Critical',
      stepType: 'Core Foundation',
      guidance: `Master fundamentals of ${m.skill} and implement in at least 1 feature.`
    })),
    ...partiallyDevelopedSkills.map((p) => ({
      skill: p.skill,
      priority: 'High',
      stepType: 'Bridge to Mastery',
      guidance: p.action
    })),
    ...missingSkills.filter((m) => m.priority === 'Medium').map((m) => ({
      skill: m.skill,
      priority: 'Medium',
      stepType: 'Industry Differentiator',
      guidance: `Add ${m.skill} to demonstrate production-readiness.`
    }))
  ];

  // Recharts/Frontend ready radar axes structure
  const radarComparison = allRoleSkills.slice(0, 8).map((skill) => {
    const isPossessed = possessedSkills.some((p) => p.skill === skill);
    const isPartial = partiallyDevelopedSkills.some((p) => p.skill === skill);
    const you = isPossessed ? 85 : isPartial ? 55 : 20;
    const marketDemand = 90;
    const gap = marketDemand - you;

    let priority = 'Market-ready';
    if (gap >= 40) priority = 'Critical';
    else if (gap >= 25) priority = 'High';
    else if (gap > 10) priority = 'Medium';

    return {
      axis: skill,
      you,
      market: marketDemand,
      gap,
      priority
    };
  });

  return {
    success: true,
    targetRole,
    matchPercentage: rawMatchScore,
    readinessLevel,
    possessedSkillsCount: possessedSkills.length,
    missingSkillsCount: missingSkills.length,
    partiallyDevelopedCount: partiallyDevelopedSkills.length,
    breakdown: {
      possessedSkills,
      partiallyDevelopedSkills,
      missingSkills,
      criticalGaps: missingSkills.filter((m) => m.priority === 'Critical').map((m) => m.skill),
      highPriorityGaps: partiallyDevelopedSkills.map((p) => p.skill),
      mediumPriorityGaps: missingSkills.filter((m) => m.priority === 'Medium').map((m) => m.skill)
    },
    recommendedLearningSequence,
    radarComparison
  };
}

module.exports = {
  analyzeSkillGap
};
