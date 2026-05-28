import { prisma } from "../db.js";
import { config } from "../config.js";
import { dateStringInTimeZone, isAlertWindowOpen, isPastDateString } from "../utils/date.js";

export async function listVisibleReminders(userId) {
  const today = dateStringInTimeZone(new Date(), config.appTimezone);

  return prisma.reminder.findMany({
    where: {
      userId,
      reminderDate: { gte: today },
      status: { not: "DELETED" }
    },
    orderBy: [{ reminderDate: "asc" }, { createdAt: "desc" }]
  });
}

export async function createReminder(userId, data) {
  if (isPastDateString(data.reminderDate, config.appTimezone)) {
    const error = new Error("Reminder date cannot be in the past.");
    error.statusCode = 400;
    throw error;
  }

  const reminder = await prisma.reminder.create({
    data: {
      title: data.title,
      body: data.body,
      reminderDate: data.reminderDate,
      userId
    }
  });

  await createNotificationIfDue(reminder);
  return reminder;
}

export async function updateReminder(userId, id, data) {
  if (data.reminderDate && isPastDateString(data.reminderDate, config.appTimezone)) {
    const error = new Error("Reminder date cannot be in the past.");
    error.statusCode = 400;
    throw error;
  }

  const current = await prisma.reminder.findFirst({ where: { id, userId } });

  if (!current || current.status === "DELETED") {
    const error = new Error("Reminder not found.");
    error.statusCode = 404;
    throw error;
  }

  const reminderDateChanged = data.reminderDate && data.reminderDate !== current.reminderDate;

  const reminder = await prisma.reminder.update({
    where: { id },
    data: {
      ...data,
      notifiedAt: reminderDateChanged ? null : undefined
    }
  });

  await createNotificationIfDue(reminder);
  return reminder;
}

export async function softDeleteReminder(userId, id) {
  const current = await prisma.reminder.findFirst({ where: { id, userId } });

  if (!current || current.status === "DELETED") {
    const error = new Error("Reminder not found.");
    error.statusCode = 404;
    throw error;
  }

  return prisma.reminder.update({
    where: { id },
    data: { status: "DELETED" }
  });
}

export async function createDailyNotifications() {
  const today = dateStringInTimeZone(new Date(), config.appTimezone);
  const dueReminders = await prisma.reminder.findMany({
    where: {
      userId: { not: null },
      reminderDate: today,
      status: "ACTIVE",
      notifiedAt: null
    }
  });

  const notifications = [];

  for (const reminder of dueReminders) {
    const notification = await createNotificationForReminder(reminder);
    notifications.push(notification);
  }

  return notifications;
}

export async function createNotificationIfDue(reminder) {
  const today = dateStringInTimeZone(new Date(), config.appTimezone);
  const shouldNotify =
    reminder.status === "ACTIVE" &&
    reminder.reminderDate === today &&
    reminder.notifiedAt === null &&
    isAlertWindowOpen(config.appTimezone, config.reminderAlertHour);

  if (!shouldNotify) {
    return null;
  }

  return createNotificationForReminder(reminder);
}

async function createNotificationForReminder(reminder) {
  const now = new Date();

  const notification = await prisma.notification.upsert({
    where: {
      reminderId_reminderDate: {
        reminderId: reminder.id,
        reminderDate: reminder.reminderDate
      }
    },
    update: {
      title: reminder.title,
      body: reminder.body,
      readAt: null,
      deliveredAt: now
    },
    create: {
      reminderId: reminder.id,
      title: reminder.title,
      body: reminder.body,
      reminderDate: reminder.reminderDate,
      deliveredAt: now
    }
  });

  await prisma.reminder.update({
    where: { id: reminder.id },
    data: { notifiedAt: now }
  });

  return notification;
}
