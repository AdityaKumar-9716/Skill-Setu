const serpapiService = require('../services/serpapiService');
const geminiService = require('../services/geminiService');
const dbService = require('../services/dbService');

async function runFullSkillSetuAudit(req, res, next) {
    try {
        const { studentSkills, targetRole, location = "India", userId } = req.body;

        console.log(`🔍 [Skill-Setu Engine] Initiating Live Audit for: ${targetRole}`);

        // STEP 1: SerpApi Live Job Ingestion
        const liveJobs = await serpapiService.fetchLiveJobs(targetRole, location);
        
        if (!liveJobs || liveJobs.length === 0) {
            const error = new Error("No market data found for this role/location.");
            error.statusCode = 404;
            throw error;
        }
        
        const cleanedJobs = serpapiService.cleanJobDescriptions(liveJobs);

        // STEP 2: Real Gemini AI Analysis
        console.log(`🧠 [Skill-Setu Engine] Analyzing with Gemini 2.5 Flash...`);
        const aiReport = await geminiService.generateAuditReport(studentSkills, targetRole, cleanedJobs);

        // STEP 3: Save to Firestore
        console.log(`💾 [Skill-Setu Engine] Saving roadmap to Database...`);
        const savedDocId = await dbService.saveRoadmap(userId, aiReport);

        // STEP 4: Return payload
        res.status(200).json({
            success: true,
            source: "Skill Setu Live Engine (Gemini + SerpApi)",
            targetRole,
            marketDataSummary: {
                jobsQueried: liveJobs.length,
                locationSampled: location
            },
            databaseId: savedDocId,
            auditResult: aiReport
        });

    } catch (error) {
        next(error);
    }
}

module.exports = { runFullSkillSetuAudit };