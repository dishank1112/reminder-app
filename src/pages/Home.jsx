import { useEffect, useRef, useState } from "react";
import { ExportPanel } from "../components/ExportPanel.jsx";
import { NotificationTray } from "../components/NotificationTray.jsx";
import { ReminderForm } from "../components/ReminderForm.jsx";
import { ReminderList } from "../components/ReminderList.jsx";
import { SummaryCards } from "../components/SummaryCards.jsx";
import { api } from "../services/api.js";

export function Home({ user, onLogout }) {
  const [health, setHealth] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [permission, setPermission] = useState(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );
  const notifiedIds = useRef(new Set());

  async function loadAll() {
    const [healthPayload, reminderPayload, notificationPayload] = await Promise.all([
      api.getHealth(),
      api.getReminders(),
      api.getUnreadNotifications()
    ]);

    setHealth(healthPayload);
    setReminders(reminderPayload);
    setNotifications(notificationPayload);
    announceNewNotifications(notificationPayload);
  }

  async function safeLoadAll() {
    try {
      setError("");
      await loadAll();
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    safeLoadAll();
    const timer = window.setInterval(safeLoadAll, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  function announceNewNotifications(nextNotifications) {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") {
      return;
    }

    nextNotifications.forEach((notification) => {
      if (notifiedIds.current.has(notification.id)) {
        return;
      }

      notifiedIds.current.add(notification.id);
      new Notification(notification.title, {
        body: notification.body,
        tag: notification.id
      });
    });
  }

  async function handleCreate(form) {
    try {
      setIsSubmitting(true);
      setError("");
      await api.createReminder(form);
      await safeLoadAll();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDone(id) {
    try {
      setError("");
      await api.markReminderDone(id);
      await safeLoadAll();
    } catch (doneError) {
      setError(doneError.message);
    }
  }

  async function handleDelete(id) {
    try {
      setError("");
      await api.deleteReminder(id);
      await safeLoadAll();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function handleRead(id) {
    try {
      await api.markNotificationRead(id);
      await safeLoadAll();
    } catch (readError) {
      setError(readError.message);
    }
  }

  async function handleReadAll() {
    try {
      await api.markAllNotificationsRead();
      await safeLoadAll();
    } catch (readError) {
      setError(readError.message);
    }
  }

  async function enableBrowserNotifications() {
    if (typeof Notification === "undefined") {
      setPermission("unsupported");
      return;
    }

    const nextPermission = await Notification.requestPermission();
    setPermission(nextPermission);
    announceNewNotifications(notifications);
  }

  return (
    <main className="app-shell">
      <section className="top-band">
        <div>
          <p className="eyebrow">Welcome, {user.name}</p>
          <h1>Reminder app</h1>
        </div>
        <div className="top-actions">
          <div className="header-meta" aria-label="Application status">
            <span>{user.email}</span>
            <span>{health?.timezone || "Loading..."}</span>
            <span>{health ? `${health.alertHour}:00 alerts` : "Loading..."}</span>
          </div>
          <button className="secondary-button" type="button" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </section>

      {error && <p className="error-banner">{error}</p>}
      <SummaryCards reminders={reminders} unreadCount={notifications.length} />

      <section className="workspace-grid">
        <div className="left-column">
          <ReminderForm onCreate={handleCreate} isSubmitting={isSubmitting} />
          <ExportPanel onError={setError} />
          {isLoading ? (
            <p className="empty-state">Loading reminders...</p>
          ) : (
            <ReminderList reminders={reminders} onDone={handleDone} onDelete={handleDelete} />
          )}
        </div>

        <NotificationTray
          notifications={notifications}
          permission={permission}
          onEnableBrowserNotifications={enableBrowserNotifications}
          onRead={handleRead}
          onReadAll={handleReadAll}
        />
      </section>
    </main>
  );
}
