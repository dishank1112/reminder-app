import { groupReminders } from "../utils/dates.js";

export function SummaryCards({ reminders, unreadCount }) {
  const groups = groupReminders(reminders);
  const activeCount = reminders.filter((reminder) => reminder.status === "ACTIVE").length;
  const doneCount = reminders.filter((reminder) => reminder.status === "DONE").length;

  return (
    <section className="summary-grid" aria-label="Reminder summary">
      <SummaryCard label="Today" value={groups.today.length} />
      <SummaryCard label="Upcoming" value={groups.upcoming.length} />
      <SummaryCard label="Active" value={activeCount} />
      <SummaryCard label="Unread alerts" value={unreadCount} tone="warm" />
      <SummaryCard label="Done" value={doneCount} />
    </section>
  );
}

function SummaryCard({ label, value, tone = "default" }) {
  return (
    <article className={`summary-card summary-card--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
