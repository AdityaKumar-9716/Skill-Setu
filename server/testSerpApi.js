const {
  fetchLiveJobs,
  cleanJobDescriptions
} = require("./services/serpapiService");

async function test() {
  const jobs = await fetchLiveJobs("software developer", "Delhi");

  console.log("Number of jobs:", jobs.length);

  const cleanText = cleanJobDescriptions(jobs);

  console.log("\nClean text length:", cleanText.length);
  console.log("\nClean job descriptions:\n");
  console.log(cleanText);
}

test();