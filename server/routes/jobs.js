const express = require('express');
const router = express.Router();

// GET /api/jobs/search?role=Software+Engineer&location=India
router.get('/search', async (req, res) => {
    try {
        const { role = "Software Engineer", location = "India" } = req.query;

        // Member 4's SerpApi scraper will hook in right here!
        res.status(200).json({
            success: true,
            query: { role, location },
            message: "SerpApi jobs endpoint ready! Awaiting Member 4 integration.",
            jobs: [
                {
                    title: "Sample Frontend Engineer",
                    company: "Tech Corp India",
                    location: "Bengaluru, Karnataka, India",
                    description: "Hands-on experience with React, Tailwind, and Node.js required."
                }
            ]
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;