import cors from "cors";
import express from "express";
import { ZodError } from "zod";
import { config } from "./config.js";
import { authRouter } from "./routes/authRoutes.js";
import { jobRouter } from "./routes/jobRoutes.js";
import { notificationRouter } from "./routes/notificationRoutes.js";
import { reminderRouter } from "./routes/reminderRoutes.js";
import { dateStringInTimeZone } from "./utils/date.js";

export const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.clientOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    today: dateStringInTimeZone(new Date(), config.appTimezone),
    timezone: config.appTimezone,
    alertHour: config.reminderAlertHour
  });
});

app.use("/api/auth", authRouter);
app.use("/api/reminders", reminderRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/jobs", jobRouter);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed.",
      errors: error.errors.map((item) => ({
        path: item.path.join("."),
        message: item.message
      }))
    });
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: error.message || "Something went wrong."
  });
});
