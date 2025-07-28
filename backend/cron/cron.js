const cron = require("node-cron");
const { deleteUnverifiedUsers } = require("../controllers/userController");

// Run the job every 30 minutes
cron.schedule("*/30 * * * *", async () => {
  console.log("Running cron job to delete unverified users.");
  try {
    await deleteUnverifiedUsers(); // Await async function
  } catch (error) {
    console.error("Cron job failed:", error.message);
  }
});
