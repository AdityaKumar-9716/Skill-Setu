<<<<<<< HEAD
const express = require("express");
const router = express.Router();

const {
  fetchLiveJobs,
  cleanJobDescriptions
} = require("../services/serpapiService");

// GET /api/jobs/search?role=Software%20Engineer&location=India
router.get("/search", async (req, res) => {
  try {
    const {
      role = "Software Engineer",
      location = "India"
    } = req.query;

    // Fetch live jobs from SerpApi
    const jobs = await fetchLiveJobs(role, location);

    // Convert SerpApi results into the format our website needs
    const formattedJobs = jobs.map((job) => ({
      title: job.title || "",
      company: job.company_name || "",
      location: job.location || "",
      description: job.description || "",
      apply_link: job.apply_options?.[0]?.link || job.share_link || ""
    }));

    res.status(200).json({
      success: true,
      query: {
        role,
        location
      },
      numberOfJobs: formattedJobs.length,
      jobs: formattedJobs
    });

  } catch (error) {
    console.error("Jobs API error:", error);

    res.status(500).json({
      success: false,
      error: "Unable to fetch jobs"
    });
  }
=======
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
>>>>>>> 67adc02a156f491129b160d17f0b71f98e36745e
});

module.exports = router;