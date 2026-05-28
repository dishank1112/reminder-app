import { formatDateLabel } from "../utils/dates.js";

export function ReminderCard({ reminder, onDone, onDelete }) {
  const isDone = reminder.status === "DONE";

  return (
    <article className={`reminder-card ${isDone ? "is-done" : ""}`}>
      <div className="reminder-card__main">
        <div className="reminder-card__topline">
          <span className="date-pill">{formatDateLabel(reminder.reminderDate)}</span>
          <span className={`status-pill status-pill--${reminder.status.toLowerCase()}`}>
            {isDone ? "Done" : "Active"}
          </span>
        </div>
        <h3>{reminder.title}</h3>
        <p>{reminder.body}</p>
      </div>

      <div className="reminder-card__actions" aria-label={`Actions for ${reminder.title}`}>
        {!isDone && (
          <button type="button" className="secondary-button" onClick={() => onDone(reminder.id)}>
            Done
          </button>
        )}
        <button type="button" className="danger-button" onClick={() => onDelete(reminder.id)}>
          Delete
        </button>
      </div>
    </article>
  );
}
