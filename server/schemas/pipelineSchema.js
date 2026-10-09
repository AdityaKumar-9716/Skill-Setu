const { z } = require('zod');

// Strict Validation Schema to prevent injection and oversized payloads
const auditRequestSchema = z.object({
    body: z.object({
        // Prevent arrays with 10,000 items from freezing the server
        studentSkills: z.array(z.string().max(50, "Skill name too long").trim())
            .min(1, "At least one skill must be provided")
            .max(50, "Maximum 50 skills allowed"),
            
        // Strict role validation
        targetRole: z.string()
            .trim()
            .min(2, "Target role must be at least 2 characters long")
            .max(100, "Target role too long")
            .regex(/^[a-zA-Z0-9\s\-_/]+$/, "Role contains invalid characters"),
            
        // Strict location validation
        location: z.string()
            .trim()
            .max(100, "Location too long")
            .regex(/^[a-zA-Z0-9\s\-,.]+$/, "Location contains invalid characters")
            .optional()
            .default("India"),
            
        // Optional user ID for DB linking (must be safe)
        userId: z.string()
            .trim()
            .max(128, "UserId too long")
            .optional()
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
