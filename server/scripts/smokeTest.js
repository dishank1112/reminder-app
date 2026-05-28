import { app } from "../app.js";
import { prisma } from "../db.js";

function tomorrowString() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function request(baseUrl, path, options = {}, token = "") {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  });

  const payload = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${path} failed: ${payload?.message}`);
  }

  return payload;
}

const server = app.listen(0);
const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}/api`;

try {
  const health = await request(baseUrl, "/health");
  const account = await request(baseUrl, "/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Smoke Tester",
      email: `smoke-${Date.now()}@example.com`,
      password: "password123"
    })
  });
  const token = account.token;
  const created = await request(baseUrl, "/reminders", {
    method: "POST",
    body: JSON.stringify({
      title: "Smoke test reminder",
      body: "This reminder verifies the API flow.",
      reminderDate: tomorrowString()
    })
  }, token);

  const listed = await request(baseUrl, "/reminders", {}, token);
  const found = listed.reminders.some((reminder) => reminder.id === created.reminder.id);

  if (!found) {
    throw new Error("Created reminder was not returned by list endpoint.");
  }

  const exportResponse = await fetch(
    `${baseUrl}/reminders/export?date=${created.reminder.reminderDate}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const exportText = await exportResponse.text();

  if (!exportResponse.ok || !exportText.includes("Smoke test reminder")) {
    throw new Error("Excel export endpoint did not include the created reminder.");
  }

  await request(baseUrl, `/reminders/${created.reminder.id}`, {
    method: "DELETE"
  }, token);

  console.log(`Smoke test passed for ${health.timezone} at alert hour ${health.alertHour}.`);
} finally {
  await prisma.$disconnect();
  server.close();
}
