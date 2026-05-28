function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildExcelWorksheet(reminders, date) {
  const rows = reminders
    .map(
      (reminder, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(reminder.title)}</td>
          <td>${escapeHtml(reminder.body)}</td>
          <td>${escapeHtml(reminder.reminderDate)}</td>
          <td>${escapeHtml(reminder.status)}</td>
          <td>${escapeHtml(new Date(reminder.createdAt).toLocaleString())}</td>
        </tr>`
    )
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      table { border-collapse: collapse; font-family: Arial, sans-serif; }
      th { background: #0e7490; color: #ffffff; font-weight: bold; }
      th, td { border: 1px solid #9ca3af; padding: 8px; vertical-align: top; }
    </style>
  </head>
  <body>
    <table>
      <caption>Reminders for ${escapeHtml(date)}</caption>
      <thead>
        <tr>
          <th>#</th>
          <th>Title</th>
          <th>Body</th>
          <th>Date</th>
          <th>Status</th>
          <th>Created At</th>
        </tr>
      </thead>
      <tbody>
        ${
          rows ||
          `<tr>
            <td colspan="6">No reminders found for ${escapeHtml(date)}.</td>
          </tr>`
        }
      </tbody>
    </table>
  </body>
</html>`;
}
