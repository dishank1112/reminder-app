import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 5000),
  clientOrigins: (process.env.CLIENT_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  appTimezone: process.env.APP_TIMEZONE || "Asia/Kolkata",
  reminderAlertHour: Number(process.env.REMINDER_ALERT_HOUR || 7),
  authSecret: process.env.AUTH_SECRET || "change-this-before-deploying-version-1",
  cronSecret: process.env.CRON_SECRET || ""
};
