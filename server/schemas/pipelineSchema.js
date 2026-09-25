const { z } = require('zod');

const auditRequestSchema = z.object({
    body: z.object({
        studentSkills: z.array(z.string()).min(1, "At least one skill must be provided"),
        targetRole: z.string().min(2, "Target role must be at least 2 characters long"),
        location: z.string().optional().default("India")
    })
});

module.exports = { auditRequestSchema };
