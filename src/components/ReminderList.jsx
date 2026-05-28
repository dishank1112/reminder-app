import { ReminderCard } from "./ReminderCard.jsx";
import { groupReminders } from "../utils/dates.js";

export function ReminderList({ reminders, onDone, onDelete }) {
  const groups = groupReminders(reminders);

  return (
    <section className="reminder-list" aria-label="Reminder list">
      <ReminderSection
        title="Today"
        emptyMessage="No reminders scheduled for today."
        reminders={groups.today}
        onDone={onDone}
        onDelete={onDelete}
      />
      <ReminderSection
        title="Upcoming"
        emptyMessage="Future reminders will appear here."
        reminders={groups.upcoming}
        onDone={onDone}
        onDelete={onDelete}
      />
    </section>
  );
}

function ReminderSection({ title, emptyMessage, reminders, onDone, onDelete }) {
  return (
    <div className="reminder-section">
      <div className="section-heading">
        <h2>{title}</h2>
        <span>{reminders.length}</span>
      </div>

      {reminders.length === 0 ? (
        <p className="empty-state">{emptyMessage}</p>
      ) : (
        <div className="card-stack">
          {reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onDone={onDone}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
