const schedule = require('node-schedule');
const { refreshBoxToken } = require('./env_utils.js');

// Schedule token refresh every 7 days
const startTokenRefreshScheduler = () => {
    schedule.scheduleJob('0 0 * * 0', async () => { // Every Sunday at midnight
        console.log("Scheduled task: Refreshing Box token...");
        try {
            await refreshBoxToken();
        } catch (error) {
            console.error("Scheduled Box token refresh failed:", error.message);
        }
    });
    console.log("Box token refresh scheduler initialized.");
};

module.exports = { startTokenRefreshScheduler };