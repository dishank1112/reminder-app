import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  createReminder,
  listVisibleReminders,
  softDeleteReminder,
  updateReminder
} from "../services/reminderService.js";
import { prisma } from "../db.js";
import { buildExcelWorksheet } from "../utils/excel.js";
import { isValidDateString } from "../utils/date.js";
import { createReminderSchema, updateReminderSchema } from "../validators/reminderSchemas.js";

export const reminderRouter = Router();

reminderRouter.use(requireAuth);

reminderRouter.get("/", async (_req, res, next) => {
  try {
    const reminders = await listVisibleReminders(_req.user.id);
    res.json({ reminders });
  } catch (error) {
    next(error);
  }
});

reminderRouter.get("/export", async (req, res, next) => {
  try {
    const date = String(req.query.date || "");

    if (!isValidDateString(date)) {
      return res.status(400).json({ message: "Use a valid date in YYYY-MM-DD format." });
    }

    const reminders = await prisma.reminder.findMany({
      where: {
        reminderDate: date,
        userId: req.user.id,
        status: { not: "DELETED" }
      },
      orderBy: [{ createdAt: "asc" }]
    });

    res.setHeader("Content-Type", "application/vnd.ms-excel; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="reminders-${date}.xls"`);
    res.send(buildExcelWorksheet(reminders, date));
  } catch (error) {
    next(error);
  }
});

reminderRouter.post("/", async (req, res, next) => {
  try {
    const data = createReminderSchema.parse(req.body);
    const reminder = await createReminder(req.user.id, data);
    res.status(201).json({ reminder });
  } catch (error) {
    next(error);
  }
});

reminderRouter.patch("/:id", async (req, res, next) => {
  try {
    const data = updateReminderSchema.parse(req.body);
    const reminder = await updateReminder(req.user.id, req.params.id, data);
    res.json({ reminder });
  } catch (error) {
    next(error);
  }
});

reminderRouter.patch("/:id/done", async (req, res, next) => {
  try {
    const reminder = await updateReminder(req.user.id, req.params.id, { status: "DONE" });
    res.json({ reminder });
  } catch (error) {
    next(error);
  }
});

reminderRouter.delete("/:id", async (req, res, next) => {
  try {
    await softDeleteReminder(req.user.id, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
