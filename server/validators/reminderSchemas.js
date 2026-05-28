import { z } from "zod";
import { isValidDateString } from "../utils/date.js";

const dateString = z.string().refine(isValidDateString, {
  message: "Use a valid date in YYYY-MM-DD format."
});

export const createReminderSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(120, "Title is too long."),
  body: z.string().trim().min(1, "Body is required.").max(2000, "Body is too long."),
  reminderDate: dateString
});

export const updateReminderSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    body: z.string().trim().min(1).max(2000).optional(),
    reminderDate: dateString.optional(),
    status: z.enum(["ACTIVE", "DONE"]).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update."
  });
