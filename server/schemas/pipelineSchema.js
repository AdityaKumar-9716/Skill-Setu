const { z } = require('zod');

const auditRequestSchema = z.object({
    body: z.object({
        studentSkills: z.array(z.string()).min(1, "At least one skill must be provided"),
        targetRole: z.string().min(2, "Target role must be at least 2 characters long"),
        location: z.string().optional().default("India")
    })
});

// Flexible schema allowing incomplete, partial, or optional fields with graceful fallbacks
const flexibleProfileSchema = z.object({
    body: z.object({
        studentSkills: z.union([z.array(z.string()), z.string(), z.record(z.any())]).optional(),
        skills: z.union([z.array(z.string()), z.string(), z.record(z.any())]).optional(),
        technicalSkills: z.union([z.array(z.string()), z.string(), z.record(z.any())]).optional(),
        targetRole: z.string().optional(),
        careerGoal: z.string().optional(),
        projects: z.array(z.any()).optional(),
        experience: z.array(z.any()).optional(),
        certifications: z.array(z.any()).optional(),
        education: z.any().optional(),
        interests: z.union([z.array(z.string()), z.string()]).optional(),
        location: z.string().optional()
    }).passthrough().optional()
});

module.exports = { auditRequestSchema, flexibleProfileSchema };

