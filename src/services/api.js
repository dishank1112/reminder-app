const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
let authToken = window.localStorage.getItem("reminder_token") || "";

export function setAuthToken(token) {
  authToken = token || "";

  if (authToken) {
    window.localStorage.setItem("reminder_token", authToken);
  } else {
    window.localStorage.removeItem("reminder_token");
  }
}

async function request(path, options = {}) {
  let response;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers,
      ...options
    });
  } catch {
    throw new Error("Reminder server is not connected. Please keep the backend running.");
  }

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload;
}

export function reminderExportUrl(date) {
  return `${API_BASE_URL}/reminders/export?date=${encodeURIComponent(date)}`;
}

export const api = {
  getStoredToken() {
    return authToken;
  },
  async register(data) {
    const payload = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data)
    });
    setAuthToken(payload.token);
    return payload.user;
  },
  async login(data) {
    const payload = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data)
    });
    setAuthToken(payload.token);
    return payload.user;
  },
  async me() {
    const payload = await request("/auth/me");
    return payload.user;
  },
  logout() {
    setAuthToken("");
  },
  async getHealth() {
    return request("/health");
  },
  async getReminders() {
    const payload = await request("/reminders");
    return payload.reminders;
  },
  async createReminder(data) {
    const payload = await request("/reminders", {
      method: "POST",
      body: JSON.stringify(data)
    });
    return payload.reminder;
  },
  async markReminderDone(id) {
    const payload = await request(`/reminders/${id}/done`, {
      method: "PATCH"
    });
    return payload.reminder;
  },
  async deleteReminder(id) {
    return request(`/reminders/${id}`, {
      method: "DELETE"
    });
  },
  async getUnreadNotifications() {
    const payload = await request("/notifications?unreadOnly=true");
    return payload.notifications;
  },
  async markNotificationRead(id) {
    const payload = await request(`/notifications/${id}/read`, {
      method: "PATCH"
    });
    return payload.notification;
  },
  async markAllNotificationsRead() {
    return request("/notifications/read-all", {
      method: "POST"
    });
  },
  async downloadRemindersForDate(date) {
    let response;

    try {
      response = await fetch(reminderExportUrl(date), {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      });
    } catch {
      throw new Error("Reminder server is not connected. Please keep the backend running.");
    }

    if (!response.ok) {
      const payload = await response.json();
      throw new Error(payload.message || "Download failed.");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `reminders-${date}.xls`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  }
};
