// server/ai/skillAnalysis.js
/**
 * Module 1: AI Skill Analysis
 *
 * Evaluates a student's profile (technical skills, projects, certifications,
 * experience, education, soft skills, interests, and career goal) to determine:
 * - Existing relevant skills
 * - Strong skills (backed by projects/experience/frameworks)
 * - Intermediate skills
 * - Skills that need improvement
 * - Missing skills for their career goal
 * - Recommended next skills and optimal learning sequence
 */

const { normalizeSkillName, CAREER_ROLES, SKILL_CATEGORIES } = require('./taxonomy');

function extractAllSkills(profile) {
  const skillsSet = new Set();

  // Helper to add skill if valid
  const add = (val) => {
    if (!val) return;
    if (typeof val === 'string') {
      val.split(/[,;\n]+/).forEach((item) => {
        const norm = normalizeSkillName(item);
        if (norm) skillsSet.add(norm);
      });
    } else if (Array.isArray(val)) {
      val.forEach(add);
    } else if (typeof val === 'object') {
      Object.keys(val).forEach((k) => {
        if (val[k]) {
          const norm = normalizeSkillName(k);
          if (norm) skillsSet.add(norm);
        }
      });
    }
  };

  if (!profile) return [];

  // Parse direct skill fields
  add(profile.studentSkills);
  add(profile.skills);
  add(profile.technicalSkills);
  add(profile.programmingLanguages);
  add(profile.frameworks);
  add(profile.tools);
  add(profile.technologies);

  // Extract skills mentioned in projects techStack
  if (Array.isArray(profile.projects)) {
    profile.projects.forEach((proj) => {
      if (proj && proj.techStack) add(proj.techStack);
      if (proj && proj.skills) add(proj.skills);
    });
  }

  // Extract skills mentioned in experience
  if (Array.isArray(profile.experience)) {
    profile.experience.forEach((exp) => {
      if (exp && exp.skills) add(exp.skills);
      if (exp && exp.techStack) add(exp.techStack);
    });
  }

  return Array.from(skillsSet);
}

function extractSoftSkills(profile) {
  const softSet = new Set();
  const add = (val) => {
    if (!val) return;
    if (typeof val === 'string') {
      val.split(/[,;\n]+/).forEach((item) => {
        const trimmed = item.trim();
        if (trimmed) softSet.add(trimmed);
      });
    } else if (Array.isArray(val)) {
      val.forEach(add);
    }
  };

  if (!profile) return [];
  add(profile.softSkills);
  return Array.from(softSet);
}

function analyzeSkills(studentProfile = {}) {
  // Graceful handling of empty or undefined input
  const rawSkills = extractAllSkills(studentProfile);
  const softSkills = extractSoftSkills(studentProfile);
  const targetRole = studentProfile.targetRole || studentProfile.careerGoal || 'Software Developer';
  const roleConfig = CAREER_ROLES[targetRole] || CAREER_ROLES['Software Developer'];
  const projects = Array.isArray(studentProfile.projects) ? studentProfile.projects : [];
  const experience = Array.isArray(studentProfile.experience) ? studentProfile.experience : [];
  const certifications = Array.isArray(studentProfile.certifications) ? studentProfile.certifications : [];

  // Project and experience tech presence tracker
  const projectTechCounts = {};
  projects.forEach((p) => {
    const stack = [];
    if (p.techStack) {
      if (Array.isArray(p.techStack)) stack.push(...p.techStack);
      else if (typeof p.techStack === 'string') stack.push(...p.techStack.split(/[,;\n]+/));
    }
    stack.forEach((tech) => {
      const norm = normalizeSkillName(tech);
      if (norm) projectTechCounts[norm] = (projectTechCounts[norm] || 0) + 1;
    });
  });

  const experienceTechCounts = {};
  experience.forEach((e) => {
    const stack = [];
    if (e.techStack) {
      if (Array.isArray(e.techStack)) stack.push(...e.techStack);
      else if (typeof e.techStack === 'string') stack.push(...e.techStack.split(/[,;\n]+/));
    }
    stack.forEach((tech) => {
      const norm = normalizeSkillName(tech);
      if (norm) experienceTechCounts[norm] = (experienceTechCounts[norm] || 0) + 1;
    });
  });

  // Categorize possessed skills
  const strongSkills = [];
  const intermediateSkills = [];
  const needsImprovement = [];
  const goalRelevantSkills = [];

  rawSkills.forEach((skill) => {
    const projCount = projectTechCounts[skill] || 0;
    const expCount = experienceTechCounts[skill] || 0;
    const isCoreRoleSkill = roleConfig.coreSkills.includes(skill);
    const isAdvRoleSkill = roleConfig.advancedSkills.includes(skill);

    if (isCoreRoleSkill || isAdvRoleSkill) {
      goalRelevantSkills.push(skill);
    }

    // Determine proficiency heuristic
    if (projCount >= 2 || expCount >= 1) {
      strongSkills.push({
        skill,
        proficiency: 'Advanced / Demonstrated',
        reason: `Validated by ${projCount > 0 ? `${projCount} practical project(s)` : ''} ${expCount > 0 ? `and work experience` : ''}`.trim()
      });
    } else if (projCount === 1) {
      intermediateSkills.push({
        skill,
        proficiency: 'Intermediate',
        reason: 'Applied in 1 project; ready for deeper architecture and testing practice.'
      });
    } else {
      // Listed skill with no project proof
      needsImprovement.push({
        skill,
        proficiency: 'Foundational / Needs Project Practice',
        reason: 'Understood theoretically, but needs hands-on project implementation.'
      });
    }
  });

  // Calculate missing skills for selected career goal
  const missingCore = roleConfig.coreSkills.filter((s) => !rawSkills.includes(s));
  const missingAdvanced = roleConfig.advancedSkills.filter((s) => !rawSkills.includes(s));

  // Determine optimal recommended next skills
  const recommendedNextSkills = [...missingCore.slice(0, 3), ...missingAdvanced.slice(0, 2)];

  // Determine recommended learning order
  const recommendedLearningOrder = recommendedNextSkills.map((skill, idx) => ({
    step: idx + 1,
    skill,
    importance: missingCore.includes(skill) ? 'Essential Core' : 'Specialized Advantage',
    action: `Build a mini-feature or project module utilizing ${skill}`
  }));

  // Strengths and weaknesses summary
  const strengths = [];
  if (strongSkills.length > 0) {
    strengths.push(`Solid hands-on foundation in ${strongSkills.map((s) => s.skill).slice(0, 3).join(', ')}.`);
  }
  if (projects.length >= 2) {
    strengths.push(`Demonstrated initiative with ${projects.length} documented technical project(s).`);
  }
  if (experience.length > 0) {
    strengths.push(`Prior professional experience provides practical industry context.`);
  }
  if (strengths.length === 0) {
    strengths.push('Clean slate with curiosity and foundation ready to build targeted portfolio projects.');
  }

  const weaknesses = [];
  if (missingCore.length > 0) {
    weaknesses.push(`Key core requirements for ${targetRole} missing: ${missingCore.slice(0, 3).join(', ')}.`);
  }
  if (needsImprovement.length > 0) {
    weaknesses.push(`${needsImprovement.length} skill(s) lack project implementation evidence.`);
  }
  if (projects.length === 0) {
    weaknesses.push('No hands-on projects listed; recruiters require tangible proof of work.');
  }

  // Soft skills assessment
  const identifiedSoftSkills = softSkills.length > 0 ? softSkills : ['Communication', 'Problem Solving'];
  const recommendedSoftSkills = roleConfig.softSkills.filter((s) => !identifiedSoftSkills.includes(s));

  return {
    success: true,
    studentName: studentProfile.name || studentProfile.studentName || 'Student',
    targetRole,
    totalSkillsIdentified: rawSkills.length,
    skillsList: rawSkills,
    analysis: {
      strongSkills,
      intermediateSkills,
      needsImprovement,
      goalRelevantSkills,
      missingCoreSkills: missingCore,
      missingAdvancedSkills: missingAdvanced,
      strengths,
      weaknesses,
      recommendedNextSkills,
      recommendedLearningOrder,
      softSkillsEvaluation: {
        demonstrated: identifiedSoftSkills,
        recommendedToCultivate: recommendedSoftSkills
      }
    }
  };
}

module.exports = {
  analyzeSkills,
  extractAllSkills
};
