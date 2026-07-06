import { format, isToday, isYesterday } from "date-fns";

/** Small formatting helpers shared across the UI. */

export function formatTime(dateStr) {
  if (!dateStr) return "";
  return format(new Date(dateStr), "hh:mm a");
}

export function formatDayLabel(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "dd MMM yyyy");
}

export function formatLastSeen(dateStr) {
  if (!dateStr) return "";
  return `last seen ${formatDayLabel(dateStr).toLowerCase()} at ${formatTime(
    dateStr
  )}`;
}

export function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
