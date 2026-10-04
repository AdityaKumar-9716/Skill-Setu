const { getJson } = require("serpapi");
require("dotenv").config();

async function fetchLiveJobs(career, location) {
  try {
    const response = await getJson({
      engine: "google_jobs",
      q: career,
      location: location,
      api_key: process.env.SERPAPI_KEY,
    });

    return response.jobs_results || [];
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
}
function cleanJobDescriptions(jobs) {
  return jobs
    .map((job) => job.description || "")
    .join("\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}
module.exports = { fetchLiveJobs , cleanJobDescriptions};