import { prisma } from "../db.js";

const statements = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "Reminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "reminderDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reminder_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reminderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "reminderDate" TEXT NOT NULL,
    "deliveredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_reminderId_fkey"
      FOREIGN KEY ("reminderId") REFERENCES "Reminder" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "Reminder_reminderDate_status_idx"
    ON "Reminder" ("reminderDate", "status")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key"
    ON "User" ("email")`,
  `CREATE INDEX IF NOT EXISTS "User_email_idx"
    ON "User" ("email")`,
  `CREATE INDEX IF NOT EXISTS "Reminder_userId_reminderDate_status_idx"
    ON "Reminder" ("userId", "reminderDate", "status")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Notification_reminderId_reminderDate_key"
    ON "Notification" ("reminderId", "reminderDate")`,
  `CREATE INDEX IF NOT EXISTS "Notification_readAt_reminderDate_idx"
    ON "Notification" ("readAt", "reminderDate")`
];

try {
  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }

  const columns = await prisma.$queryRawUnsafe(`PRAGMA table_info("Reminder")`);
  const hasUserId = columns.some((column) => column.name === "userId");

  if (!hasUserId) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Reminder" ADD COLUMN "userId" TEXT`);
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "Reminder_userId_reminderDate_status_idx"
        ON "Reminder" ("userId", "reminderDate", "status")`
    );
  }

  console.log("SQLite database is ready.");
} finally {
  await prisma.$disconnect();
}
