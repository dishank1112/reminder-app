import { config } from "./config.js";
import { app } from "./app.js";
import { prisma } from "./db.js";
import { startReminderScheduler } from "./jobs/reminderJob.js";

const server = app.listen(config.port, () => {
  console.log(`API server running on http://localhost:${config.port}`);
  console.log(`Reminder alerts scheduled for ${config.reminderAlertHour}:00 in ${config.appTimezone}`);
  startReminderScheduler();
});

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
