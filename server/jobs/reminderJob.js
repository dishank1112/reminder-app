import cron from "node-cron";
import { config } from "../config.js";
import { createDailyNotifications } from "../services/reminderService.js";
import { isAlertWindowOpen } from "../utils/date.js";

export function startReminderScheduler() {
  cron.schedule(
    `0 ${config.reminderAlertHour} * * *`,
    async () => {
      try {
        const notifications = await createDailyNotifications();
        console.log(`Reminder job delivered ${notifications.length} notification(s).`);
      } catch (error) {
        console.error("Reminder job failed:", error);
      }
    },
    {
      timezone: config.appTimezone
    }
  );

  runMissedMorningCheck();
}

async function runMissedMorningCheck() {
  if (!isAlertWindowOpen(config.appTimezone, config.reminderAlertHour)) {
    return;
  }

  try {
    const notifications = await createDailyNotifications();
    if (notifications.length > 0) {
      console.log(`Startup check delivered ${notifications.length} notification(s).`);
    }
  } catch (error) {
    console.error("Startup reminder check failed:", error);
  }
}
