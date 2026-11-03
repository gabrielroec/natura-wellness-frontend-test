const DAY_MS = 24 * 60 * 60 * 1000;

const sameYear = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const otherYear = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function addDays(iso: string, days: number) {
  return new Date(Date.parse(iso) + days * DAY_MS).toISOString();
}

export function formatDate(iso: string, now = new Date()) {
  const date = new Date(iso);
  return (date.getFullYear() === now.getFullYear() ? sameYear : otherYear).format(date);
}

export function formatRelativeDate(iso: string, now = new Date()) {
  const days = Math.round((startOfDay(new Date(iso)) - startOfDay(now)) / DAY_MS);
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  return days > 0 ? `in ${days} days` : `${-days} days ago`;
}
