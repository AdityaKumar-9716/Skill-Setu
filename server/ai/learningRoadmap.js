// server/ai/learningRoadmap.js
/**
 * Module 6: Personalized Learning Roadmap
 *
 * Constructs a customized, phased learning roadmap based on:
 * - Current skills & demonstrated level
 * - Target career path
 * - Identified skill gaps
 * - Existing projects
 *
 * Skips beginner fundamentals that the student has already demonstrated,
 * advancing directly to real gap areas and portfolio-ready deliverables.
 */

const { CAREER_ROLES } = require('./taxonomy');
const { extractAllSkills } = require('./skillAnalysis');

// Curated resource repository for standard competencies
const LEARNING_RESOURCES = {
  'JavaScript': [
    { title: 'MDN Web Docs — JavaScript Guide', provider: 'developer.mozilla.org', type: 'Documentation' },
    { title: 'javascript.info — Deep Dive Modern JS', provider: 'javascript.info', type: 'Interactive Tutorial' }
  ],
  'TypeScript': [
    { title: 'TypeScript Handbook — Discriminated Unions & Generics', provider: 'typescriptlang.org', type: 'Official Guide' },
    { title: 'Total TypeScript Core Patterns', provider: 'totaltypescript.com', type: 'Course & Exercises' }
  ],
  'React': [
    { title: 'React Documentation — Thinking in React', provider: 'react.dev', type: 'Official Guide' },
    { title: 'Epic React Performance & State Composition', provider: 'kentcdodds.com', type: 'Advanced Guide' }
  ],
  'Next.js': [
    { title: 'Next.js App Router Documentation', provider: 'nextjs.org/docs', type: 'Official Guide' },
    { title: 'Server Components and Streaming in Practice', provider: 'vercel.com/guides', type: 'Architecture Deep-Dive' }
  ],
  'Node.js': [
    { title: 'Node.js Core Architecture & Event Loop', provider: 'nodejs.org/docs', type: 'Official Guide' },
    { title: 'Production Express & Clean Middleware Design', provider: 'expressjs.com', type: 'Best Practices' }
  ],
  'SQL': [
    { title: 'Mode Analytics — SQL for Data Analysis & Window Functions', provider: 'mode.com/sql-tutorial', type: 'Interactive Tutorial' },
    { title: 'Use The Index, Luke — Relational DB Indexing', provider: 'use-the-index-luke.com', type: 'Database Performance' }
  ],
  'Python': [
    { title: 'Python Official Documentation & PEP 8 Standards', provider: 'python.org/doc', type: 'Official Guide' },
    { title: 'Real Python — Intermediate Data Structures & Typing', provider: 'realpython.com', type: 'Tutorial' }
  ],
  'Pandas': [
    { title: 'Pandas User Guide — Performance, Vectorization & Eval', provider: 'pandas.pydata.org', type: 'Official Guide' }
  ],
  'Machine Learning': [
    { title: 'Scikit-learn User Guide & Model Evaluation', provider: 'scikit-learn.org', type: 'Official Guide' },
    { title: 'Google Machine Learning Crash Course', provider: 'developers.google.com', type: 'Interactive Course' }
  ],
  'Docker': [
    { title: 'Docker Official Get-Started Workshop', provider: 'docs.docker.com', type: 'Official Guide' },
    { title: 'Container Security & Multi-Stage Builds', provider: 'docker.com/blog', type: 'Production Guide' }
  ],
  'AWS': [
    { title: 'AWS Cloud Practitioner & S3/EC2/Lambda Essentials', provider: 'aws.amazon.com/training', type: 'Free Labs' }
  ],
  'Git': [
    { title: 'Pro Git Book (Chacon & Straub)', provider: 'git-scm.com/book', type: 'Free Book' }
  ]
};

function generateLearningRoadmap(studentProfile = {}, targetRoleParam) {
  const currentSkills = extractAllSkills(studentProfile);
  const currentSkillsLower = new Set(currentSkills.map((s) => s.toLowerCase()));
  const targetRole = targetRoleParam || studentProfile.targetRole || studentProfile.careerGoal || 'Software Developer';
  const roleConfig = CAREER_ROLES[targetRole] || CAREER_ROLES['Software Developer'];

  const coreSkills = roleConfig.coreSkills;
  const advancedSkills = roleConfig.advancedSkills;

  // Determine missing skills
  const missingCore = coreSkills.filter((s) => !currentSkillsLower.has(s.toLowerCase()));
  const missingAdv = advancedSkills.filter((s) => !currentSkillsLower.has(s.toLowerCase()));

  // If student already has core skill, check if they have advanced counterpart
  const learningSequence = [];

  // 1. Missing core foundations
  missingCore.forEach((skill) => {
    learningSequence.push({
      skill,
      isCore: true,
      phase: 'Phase 1: Foundational Competencies',
      duration: 'Weeks 1–2'
    });
  });

  // 2. Missing advanced / specialization skills
  missingAdv.forEach((skill) => {
    learningSequence.push({
      skill,
      isCore: false,
      phase: 'Phase 2: Production Readiness & Portfolio',
      duration: 'Weeks 3–4'
    });
  });

  // If the candidate already possesses almost everything, add mastery / testing / system design
  if (learningSequence.length === 0) {
    learningSequence.push(
      { skill: 'System Design & High-Availability Architecture', isCore: false, phase: 'Phase 1', duration: 'Weeks 1–2' },
      { skill: 'Automated CI/CD & Production Observability', isCore: false, phase: 'Phase 2', duration: 'Weeks 3–4' }
    );
  }

  // Build the structured roadmap steps (up to 6 focused milestones)
  const roadmapSteps = learningSequence.slice(0, 6).map((item, index) => {
    const weekNum = (index + 1) * 2 - 1;
    const weekRange = `Weeks ${weekNum}–${weekNum + 1}`;
    const resources = LEARNING_RESOURCES[item.skill] || [
      { title: `${item.skill} Official Documentation & Architecture Guide`, provider: 'Official Source', type: 'Documentation' },
      { title: `Building Production Applications with ${item.skill}`, provider: 'Skill Setu Curated', type: 'Hands-on Guide' }
    ];

    return {
      stepNumber: index + 1,
      weekRange,
      phase: item.phase,
      skill: item.skill,
      title: `${item.isCore ? 'Core Mastery' : 'Specialization'}: ${item.skill}`,
      objective: `Acquire practical fluency in ${item.skill} and apply it in a verifiable project artifact.`,
      actionItems: [
        `Study ${item.skill} architecture, syntax, and best practices.`,
        `Build a standalone micro-module or feature using ${item.skill}.`,
        `Write comprehensive unit tests or verification checks covering edge cases.`,
        `Commit code to GitHub with detailed README and documentation.`
      ],
      recommendedProject: `Implement a focused ${item.skill} module integrated into your ${targetRole} portfolio.`,
      expectedOutcome: `A working, testable codebase validating your ${item.skill} capability.`,
      resources
    };
  });

  return {
    success: true,
    targetRole,
    studentLevel: currentSkills.length > 5 ? 'Intermediate' : 'Foundational',
    skillsAccountedFor: currentSkills,
    skillsLearnedSkipped: currentSkills.filter((s) => coreSkills.includes(s)),
    totalWeeksEstimated: roadmapSteps.length * 2,
    roadmap: roadmapSteps
  };
}

module.exports = {
  generateLearningRoadmap
};
