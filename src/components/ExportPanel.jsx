import { useState } from "react";
import { api } from "../services/api.js";
import { todayString } from "../utils/dates.js";

export function ExportPanel({ onError }) {
  const [date, setDate] = useState(todayString());
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    try {
      setIsDownloading(true);
      await api.downloadRemindersForDate(date);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <section className="export-panel" aria-label="Download reminders">
      <div>
        <p className="eyebrow">Excel export</p>
        <h2>Download events by day</h2>
      </div>

      <div className="export-row">
        <div className="field">
          <label htmlFor="exportDate">Date</label>
          <input
            id="exportDate"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? "Downloading..." : "Download Excel"}
        </button>
      </div>
    </section>
  );
}
