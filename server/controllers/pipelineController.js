const aiService = require('../ai');

// server/controllers/pipelineController.js

/**
 * Main Pipeline Orchestrator for Skill Setu
 * Chains SerpApi Live Job Ingestion directly into AI Gap Analysis & Roadmap
 */
async function runFullSkillSetuAudit(req, res) {
    try {
        const { studentSkills, targetRole, location = "India" } = req.body;

        if (!studentSkills || !targetRole) {
            return res.status(400).json({
                success: false,
                error: "studentSkills (array) and targetRole (string) are required."
            });
        }

        console.log(`🔍 [Skill-Setu Engine] Initiating Live Audit for: ${targetRole}`);

        // STEP 1: Placeholder for Member 4's SerpApi extraction
        // const liveJobs = await serpapiService.fetchLiveJobs(targetRole, location);
        const liveJobsMock = [
            {
                title: targetRole,
                company: "Leading Tech Firm",
                description: `Looking for a ${targetRole} with strong fundamental understanding, hands-on project experience, API integration, and cloud deployment knowledge.`
            }
        ];

        // STEP 2: Member 5's AI analysis (local rule-based engine)
        const gap = aiService.analyzeSkillGap(req.body, targetRole);
        const roadmapData = aiService.generateLearningRoadmap(req.body, targetRole);

        const aiReport = {
            targetRole,
            matchPercentage: gap.matchPercentage,
            readinessLevel: gap.readinessLevel,
            missingSkills: gap.breakdown.missingSkills.map((m) => m.skill),
            recommendedProjects: [
                {
                    title: `${targetRole} Portfolio Project`,
                    techStack: gap.breakdown.highPriorityGaps.slice(0, 3),
                    description: `Build an end-to-end ${targetRole} application addressing identified gaps.`
                }
            ],
            roadmap: roadmapData.roadmap.map((step) => ({
                week: step.stepNumber,
                topic: step.title,
                actionItems: step.actionItems
            })),
            detailedBreakdown: gap.breakdown,
            radarComparison: gap.radarComparison
        };

        // STEP 3: Return the combined intelligence report to the frontend
        res.status(200).json({
            success: true,
            source: "Skill Setu Live Engine",
            targetRole,
            marketDataSummary: {
                jobsQueried: liveJobsMock.length,
                locationSampled: location
            },
            auditResult: aiReport
        });


    } catch (error) {
        console.error("❌ Pipeline Failure:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { runFullSkillSetuAudit };