export function dateStringInTimeZone(date = new Date(), timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function hourInTimeZone(date = new Date(), timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);

  const hour = parts.find((part) => part.type === "hour")?.value || "0";
  return Number(hour);
}

export function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isPastDateString(value, timeZone) {
  return value < dateStringInTimeZone(new Date(), timeZone);
}

export function isAlertWindowOpen(timeZone, alertHour) {
  return hourInTimeZone(new Date(), timeZone) >= alertHour;
}
