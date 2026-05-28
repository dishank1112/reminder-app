import { useState } from "react";
import { todayString } from "../utils/dates.js";

const initialForm = {
  title: "",
  body: "",
  reminderDate: todayString()
};

export function ReminderForm({ onCreate, isSubmitting }) {
  const [form, setForm] = useState(initialForm);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onCreate(form);
    setForm({ ...initialForm, reminderDate: todayString() });
  }

  return (
    <form className="reminder-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          value={form.title}
          onChange={updateField}
          maxLength={120}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="body">Body</label>
        <textarea
          id="body"
          name="body"
          value={form.body}
          onChange={updateField}
          rows="5"
          maxLength={2000}
          required
        />
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="reminderDate">Date</label>
          <input
            id="reminderDate"
            name="reminderDate"
            type="date"
            value={form.reminderDate}
            min={todayString()}
            onChange={updateField}
            required
          />
        </div>
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Add reminder"}
        </button>
      </div>
    </form>
  );
}
