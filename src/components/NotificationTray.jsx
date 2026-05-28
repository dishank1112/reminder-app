import { formatDateLabel } from "../utils/dates.js";

export function NotificationTray({
  notifications,
  permission,
  onEnableBrowserNotifications,
  onRead,
  onReadAll
}) {
  return (
    <aside className="notification-tray" aria-label="Reminder alerts">
      <div className="tray-header">
        <div>
          <p className="eyebrow">7 AM alerts</p>
          <h2>{notifications.length} unread</h2>
        </div>
        <button className="secondary-button" type="button" onClick={onEnableBrowserNotifications}>
          {permission === "granted" ? "Enabled" : "Enable"}
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="empty-state">Alerts for due reminders will land here.</p>
      ) : (
        <>
          <div className="alert-stack">
            {notifications.map((notification) => (
              <article className="alert-card" key={notification.id}>
                <div>
                  <span className="date-pill">{formatDateLabel(notification.reminderDate)}</span>
                  <h3>{notification.title}</h3>
                  <p>{notification.body}</p>
                </div>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => onRead(notification.id)}
                >
                  Read
                </button>
              </article>
            ))}
          </div>
          <button className="text-button" type="button" onClick={onReadAll}>
            Mark all as read
          </button>
        </>
      )}
    </aside>
  );
}
