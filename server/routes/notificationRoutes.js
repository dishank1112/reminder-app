import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const notificationRouter = Router();

notificationRouter.use(requireAuth);

notificationRouter.get("/", async (req, res, next) => {
  try {
    const unreadOnly = req.query.unreadOnly !== "false";
    const notifications = await prisma.notification.findMany({
      where: {
        ...(unreadOnly ? { readAt: null } : {}),
        reminder: {
          userId: req.user.id
        }
      },
      orderBy: [{ reminderDate: "asc" }, { deliveredAt: "desc" }]
    });

    res.json({ notifications });
  } catch (error) {
    next(error);
  }
});

notificationRouter.patch("/:id/read", async (req, res, next) => {
  try {
    const current = await prisma.notification.findFirst({
      where: {
        id: req.params.id,
        reminder: {
          userId: req.user.id
        }
      }
    });

    if (!current) {
      return res.status(404).json({ message: "Notification not found." });
    }

    const notification = await prisma.notification.update({
      where: { id: current.id },
      data: { readAt: new Date() }
    });

    res.json({ notification });
  } catch (error) {
    next(error);
  }
});

notificationRouter.post("/read-all", async (req, res, next) => {
  try {
    const unreadNotifications = await prisma.notification.findMany({
      where: {
        readAt: null,
        reminder: {
          userId: req.user.id
        }
      },
      select: { id: true }
    });

    const result = await prisma.notification.updateMany({
      where: {
        id: { in: unreadNotifications.map((notification) => notification.id) }
      },
      data: { readAt: new Date() }
    });

    res.json({ updated: result.count });
  } catch (error) {
    next(error);
  }
});
