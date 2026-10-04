// server/test-ai.js
/**
 * Test Suite for Skill Setu AI Engine
 *
 * Verifies all 6 AI modules + Full Audit against:
 * 1. Complete student profile
 * 2. Partial student profile
 * 3. Empty student profile
 * 4. Edge cases / invalid inputs
 */

const aiService = require('./ai');

console.log('====================================================');
console.log('🧪 SKILL SETU AI ENGINE TEST SUITE');
console.log('====================================================\n');

// Sample Profile 1: Complete Student Profile
const completeProfile = {
  name: 'Aarav Sharma',
  studentSkills: ['Python', 'HTML', 'CSS', 'JavaScript', 'C'],
  softSkills: ['Communication', 'Teamwork'],
  targetRole: 'Full Stack Developer',
  projects: [
    {
      title: 'E-commerce Bookstore',
      description: 'Built a responsive web store with product catalog and cart serving 500+ users.',
      techStack: ['JavaScript', 'HTML', 'CSS', 'Node.js'],
      githubUrl: 'https://github.com/aarav/bookstore'
    },
    {
      title: 'Weather Dashboard',
      description: 'Live weather forecaster consuming OpenWeather API with 99.9% uptime.',
      techStack: ['React', 'JavaScript', 'Tailwind CSS'],
      githubUrl: 'https://github.com/aarav/weather'
    }
  ],
  education: {
    degree: 'B.Tech in Computer Science',
    college: 'NIT Surathkal',
    year: 2026
  },
  experience: [
    {
      role: 'Web Development Intern',
      company: 'Startup Hub',
      duration: '3 months',
      techStack: ['React', 'HTML', 'CSS']
    }
  ],
  interests: ['Web Development', 'Cloud Computing', 'UI/UX']
};

// Sample Profile 2: Partial Student Profile (Only C & Python, 0 projects, Data Scientist goal)
const partialProfile = {
  studentSkills: ['C', 'Python'],
  careerGoal: 'Data Scientist'
};

// Sample Profile 3: Completely Empty Profile
const emptyProfile = {};

let testsPassed = 0;
let testsFailed = 0;

function runTest(testName, fn) {
  try {
    process.stdout.write(`Testing: ${testName} ... `);
    fn();
    console.log('✅ PASSED');
    testsPassed++;
  } catch (err) {
    console.log('❌ FAILED:', err.message);
    console.error(err);
    testsFailed++;
  }
}

// ----------------------------------------------------
// Test 1: AI Skill Analysis
// ----------------------------------------------------
runTest('Skill Analysis (Complete Profile)', () => {
  const result = aiService.analyzeSkills(completeProfile);
  if (!result.success) throw new Error('Result was not successful');
  if (result.analysis.strongSkills.length === 0) throw new Error('Expected strong skills');
  if (result.analysis.missingCoreSkills.length === 0) throw new Error('Expected missing core skills for Full Stack');
  if (!Array.isArray(result.analysis.recommendedLearningOrder)) throw new Error('Missing learning order');
});

runTest('Skill Analysis (Partial Profile)', () => {
  const result = aiService.analyzeSkills(partialProfile);
  if (!result.success) throw new Error('Result was not successful');
  if (result.skillsList.length !== 2) throw new Error('Expected 2 skills');
  if (result.analysis.weaknesses.length === 0) throw new Error('Expected weaknesses for partial profile');
});

runTest('Skill Analysis (Empty Profile - Graceful Fallback)', () => {
  const result = aiService.analyzeSkills(emptyProfile);
  if (!result.success) throw new Error('Result was not successful');
  if (!Array.isArray(result.skillsList)) throw new Error('Expected empty skills array');
});

// ----------------------------------------------------
// Test 2: AI Skill Gap Analysis
// ----------------------------------------------------
runTest('Skill Gap Analysis (Complete Profile -> Full Stack)', () => {
  const result = aiService.analyzeSkillGap(completeProfile, 'Full Stack Developer');
  if (!result.success) throw new Error('Result was not successful');
  if (typeof result.matchPercentage !== 'number') throw new Error('Match percentage must be a number');
  if (!result.breakdown.possessedSkills.length) throw new Error('Expected possessed skills');
  if (!result.breakdown.missingSkills.length) throw new Error('Expected missing skills');
  if (result.radarComparison.length === 0) throw new Error('Expected radar comparison data');
});

runTest('Skill Gap Analysis (Partial Profile -> AI/ML Engineer)', () => {
  const result = aiService.analyzeSkillGap(partialProfile, 'AI/ML Engineer');
  if (!result.success) throw new Error('Result was not successful');
  if (!result.breakdown.criticalGaps.length) throw new Error('Expected critical gaps');
  if (result.matchPercentage >= 70) throw new Error('Partial profile match score should be modest');
});

runTest('Skill Gap Analysis (Empty Profile - Graceful Fallback)', () => {
  const result = aiService.analyzeSkillGap(emptyProfile);
  if (!result.success) throw new Error('Result was not successful');
  if (result.matchPercentage > 20) throw new Error('Empty profile should have low match score');
});

// ----------------------------------------------------
// Test 3: AI Career Recommendation
// ----------------------------------------------------
runTest('Career Recommendation (Complete Profile)', () => {
  const result = aiService.recommendCareers(completeProfile);
  if (!result.success) throw new Error('Result was not successful');
  if (!Array.isArray(result.recommendations) || result.recommendations.length === 0) throw new Error('Expected recommendations array');
  const top = result.recommendations[0];
  if (!top.careerName || !top.matchScore || !top.whyItMatches) throw new Error('Malformed recommendation item');
});

runTest('Career Recommendation (Empty Profile - Graceful Fallback)', () => {
  const result = aiService.recommendCareers(emptyProfile);
  if (!result.success) throw new Error('Result was not successful');
  if (result.recommendations.length === 0) throw new Error('Expected fallback career options');
});

// ----------------------------------------------------
// Test 4: AI Opportunity / Company Matching (Demo Data)
// ----------------------------------------------------
runTest('Opportunity Matching (Complete Profile)', () => {
  const result = aiService.matchOpportunities(completeProfile);
  if (!result.success) throw new Error('Result was not successful');
  if (result.opportunities.length === 0) throw new Error('Expected matched demo opportunities');
  const topOpp = result.opportunities[0];
  if (!topOpp.isDemoData) throw new Error('Opportunity must be explicitly marked as demo data');
  if (!topOpp.matchScore || !topOpp.matchingStrengths || !topOpp.skillGaps) throw new Error('Malformed opportunity match');
});

runTest('Opportunity Matching (Empty Profile - Graceful Fallback)', () => {
  const result = aiService.matchOpportunities(emptyProfile);
  if (!result.success) throw new Error('Result was not successful');
  if (result.opportunities.length === 0) throw new Error('Expected opportunities with low match scores');
});

// ----------------------------------------------------
// Test 5: AI Profile / Resume Analysis
// ----------------------------------------------------
runTest('Profile Analysis (Complete Profile)', () => {
  const result = aiService.analyzeProfile(completeProfile);
  if (!result.success) throw new Error('Result was not successful');
  if (result.completenessScore < 60) throw new Error('Complete profile should have good completeness score');
  if (!result.actionChecklist || result.actionChecklist.length === 0) throw new Error('Expected action checklist');
});

runTest('Profile Analysis (Partial Profile - Detects Missing Project Info)', () => {
  const result = aiService.analyzeProfile(partialProfile);
  if (!result.success) throw new Error('Result was not successful');
  if (result.weakAreas.length === 0) throw new Error('Expected weak areas flagged');
});

runTest('Profile Analysis (Empty Profile - Graceful Fallback)', () => {
  const result = aiService.analyzeProfile(emptyProfile);
  if (!result.success) throw new Error('Result was not successful');
  if (result.completenessScore > 30) throw new Error('Empty profile should have low score');
});

// ----------------------------------------------------
// Test 6: AI Personalized Learning Roadmap
// ----------------------------------------------------
runTest('Learning Roadmap (Complete Profile -> Full Stack)', () => {
  const result = aiService.generateLearningRoadmap(completeProfile, 'Full Stack Developer');
  if (!result.success) throw new Error('Result was not successful');
  if (!Array.isArray(result.roadmap) || result.roadmap.length === 0) throw new Error('Expected roadmap steps');
  // Check that demonstrated skills are accounted for
  if (!result.skillsLearnedSkipped.includes('JavaScript')) throw new Error('Expected demonstrated JavaScript to be skipped/accounted for');
});

runTest('Learning Roadmap (Empty Profile - Graceful Fallback)', () => {
  const result = aiService.generateLearningRoadmap(emptyProfile, 'Frontend Developer');
  if (!result.success) throw new Error('Result was not successful');
  if (result.roadmap.length === 0) throw new Error('Expected beginner roadmap steps');
});

// ----------------------------------------------------
// Test 7: Master Audit Pipeline
// ----------------------------------------------------
runTest('Full Audit Pipeline', () => {
  const result = aiService.runFullAudit(completeProfile, 'Full Stack Developer', 'Bengaluru');
  if (!result.success) throw new Error('Result was not successful');
  if (!result.skillAnalysis || !result.gapAnalysis || !result.learningRoadmap || !result.topMatchingOpportunities) {
    throw new Error('Full audit missing sub-modules');
  }
});

// ----------------------------------------------------
// Test 8: End-to-End Sequential AI Pipeline Flow
// Student Profile -> Profile Analysis -> Skill Analysis -> Skill Gap Analysis
// -> Career Recommendation -> Opportunity Matching -> Personalized Learning Roadmap
// ----------------------------------------------------
runTest('End-to-End Sequential Pipeline (Profile -> Skill -> Gap -> Career -> Opps -> Roadmap)', () => {
  // Step 1: Profile Analysis
  const profileReport = aiService.analyzeProfile(completeProfile);
  if (!profileReport.success || typeof profileReport.completenessScore !== 'number') {
    throw new Error('Step 1 (Profile Analysis) failed');
  }

  // Step 2: Skill Analysis
  const skillReport = aiService.analyzeSkills(completeProfile);
  if (!skillReport.success || !Array.isArray(skillReport.skillsList)) {
    throw new Error('Step 2 (Skill Analysis) failed');
  }

  // Step 3: Skill Gap Analysis
  const targetRole = completeProfile.targetRole || 'Full Stack Developer';
  const gapReport = aiService.analyzeSkillGap(completeProfile, targetRole);
  if (!gapReport.success || !Array.isArray(gapReport.radarComparison)) {
    throw new Error('Step 3 (Skill Gap Analysis) failed');
  }

  // Step 4: Career Recommendation
  const careerReport = aiService.recommendCareers(completeProfile);
  if (!careerReport.success || !careerReport.recommendations.length) {
    throw new Error('Step 4 (Career Recommendation) failed');
  }

  // Step 5: Opportunity Matching (Local Demo Data)
  const oppReport = aiService.matchOpportunities(completeProfile);
  if (!oppReport.success || !oppReport.opportunities.length || !oppReport.opportunities[0].isDemoData) {
    throw new Error('Step 5 (Opportunity Matching) failed');
  }

  // Step 6: Personalized Learning Roadmap
  const roadmapReport = aiService.generateLearningRoadmap(completeProfile, targetRole);
  if (!roadmapReport.success || !roadmapReport.roadmap.length) {
    throw new Error('Step 6 (Personalized Learning Roadmap) failed');
  }
});

console.log('\n====================================================');
console.log(`📊 TEST RESULTS: ${testsPassed} Passed | ${testsFailed} Failed`);

console.log('====================================================');

if (testsFailed > 0) {
  process.exit(1);
}
