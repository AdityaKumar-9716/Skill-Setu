// server/ai/profileAnalysis.js
/**
 * Module 5: AI Profile / Resume Analysis
 *
 * Evaluates student profile & resume content to identify:
 * - Missing important skills for employability
 * - Weak profile areas (lack of metrics, descriptions, links)
 * - Missing project information & measurable achievements
 * - Skills that should be highlighted prominently
 * - Actionable steps to improve recruiter appeal
 */

const { CAREER_ROLES } = require('./taxonomy');
const { extractAllSkills } = require('./skillAnalysis');

function analyzeProfile(studentProfile = {}) {
  const currentSkills = extractAllSkills(studentProfile);
  const targetRole = studentProfile.targetRole || studentProfile.careerGoal || 'Software Developer';
  const roleConfig = CAREER_ROLES[targetRole] || CAREER_ROLES['Software Developer'];

  const projects = Array.isArray(studentProfile.projects) ? studentProfile.projects : [];
  const experience = Array.isArray(studentProfile.experience) ? studentProfile.experience : [];
  const education = studentProfile.education || {};
  const certifications = Array.isArray(studentProfile.certifications) ? studentProfile.certifications : [];

  const weakAreas = [];
  const missingProjectInfo = [];
  const measurableAchievementSuggestions = [];
  const employabilityImprovements = [];
  const actionChecklist = [];

  let completenessScore = 20; // baseline

  // 1. Evaluate Skills
  if (currentSkills.length >= 6) {
    completenessScore += 25;
  } else if (currentSkills.length >= 3) {
    completenessScore += 15;
    weakAreas.push('Limited skill inventory: only ' + currentSkills.length + ' skills listed. Aim for 6–10 relevant competencies.');
  } else {
    completenessScore += 5;
    weakAreas.push('Critical skill deficit: very few technical skills listed. Add programming languages, frameworks, and developer tools.');
  }

  // Check missing important skills for their goal
  const missingCore = roleConfig.coreSkills.filter((s) => !currentSkills.includes(s));
  const skillsToHighlight = currentSkills.filter((s) =>
    roleConfig.coreSkills.includes(s) || roleConfig.advancedSkills.includes(s)
  );

  // 2. Evaluate Projects
  if (projects.length >= 2) {
    completenessScore += 25;
  } else if (projects.length === 1) {
    completenessScore += 15;
    weakAreas.push('Only 1 project listed. Recruiters look for at least 2 distinct technical projects demonstrating breadth and depth.');
  } else {
    weakAreas.push('No projects found. Hands-on projects are the single highest weighted factor for entry-level engineering roles.');
  }

  projects.forEach((proj, idx) => {
    const title = proj.title || `Project #${idx + 1}`;
    const desc = proj.description || '';
    const hasNumbers = /\d+%|\d+x|\d+\s*(users|requests|ms|seconds|records|stars)/i.test(desc);
    const hasLink = Boolean(proj.githubUrl || proj.liveUrl || proj.link);

    if (!desc || desc.length < 30) {
      missingProjectInfo.push(`Project "${title}": Description is brief or missing. Provide a 2–3 line summary outlining Problem, Solution, and Architecture.`);
    }

    if (!proj.techStack || (Array.isArray(proj.techStack) && proj.techStack.length === 0)) {
      missingProjectInfo.push(`Project "${title}": Missing explicit tech stack tag list.`);
    }

    if (!hasLink) {
      missingProjectInfo.push(`Project "${title}": Missing live deployment or GitHub repository link.`);
    }

    if (!hasNumbers) {
      measurableAchievementSuggestions.push(`Project "${title}": Add quantifiable metrics (e.g. "Reduced query latency by 35%", "Served 500+ requests", "Processed 10k rows").`);
    }
  });

  // 3. Evaluate Education & Experience
  if (education.degree || education.college || education.branch) {
    completenessScore += 15;
  } else {
    weakAreas.push('Incomplete education details: specify your degree, specialization, and expected graduation year.');
  }

  if (experience.length > 0) {
    completenessScore += 15;
  }

  // Cap completeness
  completenessScore = Math.min(100, completenessScore);

  // 4. Formulate Employability Improvements
  if (skillsToHighlight.length > 0) {
    employabilityImprovements.push(`Front-load high-demand keywords on your resume header: ${skillsToHighlight.slice(0, 4).join(', ')}.`);
  }

  if (missingCore.length > 0) {
    employabilityImprovements.push(`Add portfolio evidence for missing core competencies: ${missingCore.slice(0, 2).join(', ')}.`);
  }

  employabilityImprovements.push('Ensure every bullet point follows Google XYZ formula: "Accomplished [X], as measured by [Y], by doing [Z]".');

  if (certifications.length === 0) {
    employabilityImprovements.push('Complete at least one recognized credential or open-source contribution to validate continuous learning.');
  }

  // 5. Action Checklist
  actionChecklist.push({ task: 'Add GitHub / demo URLs to all listed projects', priority: 'High', completed: false });
  actionChecklist.push({ task: `Incorporate missing core skills: ${missingCore.slice(0, 3).join(', ')}`, priority: 'Critical', completed: false });
  actionChecklist.push({ task: 'Quantify project achievements with percentages, row counts, or speeds', priority: 'High', completed: false });
  actionChecklist.push({ task: 'Add concise summary statement targeted at ' + targetRole, priority: 'Medium', completed: false });

  return {
    success: true,
    targetRole,
    completenessScore,
    profileHealth: completenessScore >= 80 ? 'Strong / Recruiter Ready' : completenessScore >= 55 ? 'Moderate / Needs Polish' : 'Needs Significant Attention',
    skillsAnalysis: {
      skillsToHighlight: skillsToHighlight.length > 0 ? skillsToHighlight : currentSkills.slice(0, 4),
      missingImportantSkills: missingCore.slice(0, 5)
    },
    weakAreas,
    missingProjectInfo,
    measurableAchievementSuggestions,
    employabilityImprovements,
    actionChecklist
  };
}

module.exports = {
  analyzeProfile
};
