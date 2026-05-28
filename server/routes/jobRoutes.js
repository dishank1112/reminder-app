import { Router } from "express";
import { config } from "../config.js";
import { createDailyNotifications } from "../services/reminderService.js";

export const jobRouter = Router();

async function runReminderJob(req, res, next) {
  try {
    if (config.cronSecret) {
      const authHeader = req.get("authorization") || "";

      if (authHeader !== `Bearer ${config.cronSecret}`) {
        return res.status(401).json({ message: "Unauthorized cron request." });
      }
    }

    const notifications = await createDailyNotifications();
    res.json({ delivered: notifications.length, notifications });
  } catch (error) {
    next(error);
  }
}

jobRouter.get("/run-reminders", runReminderJob);
jobRouter.post("/run-reminders", runReminderJob);
