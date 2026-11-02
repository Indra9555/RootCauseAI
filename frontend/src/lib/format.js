// Backend timestamps may arrive without a UTC offset (naive ISO strings).
// They are UTC, so mark them as such before parsing.
export function parseDate(value) {
  if (!value) {
    return null;
  }

  const text = String(value).trim().replace(" ", "T");
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(text);
  const date = new Date(hasZone ? text : `${text}Z`);

  return Number.isNaN(date.getTime()) ? null : date;
}

const TIME = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});

const DATE_TIME = new Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});

export function formatTime(value) {
  const date = parseDate(value);
  return date ? TIME.format(date) : "—";
}

export function formatDateTime(value) {
  const date = parseDate(value);
  return date ? DATE_TIME.format(date) : "—";
}

export function formatDuration(startValue, endValue) {
  const start = parseDate(startValue);

  if (!start) {
    return "—";
  }

  const end = parseDate(endValue) || new Date();
  const totalSeconds = Math.max(
    0,
    Math.round((end - start) / 1000)
  );

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  }

  return `${seconds}s`;
}

export function formatOffset(fromValue, toValue) {
  const from = parseDate(fromValue);
  const to = parseDate(toValue);

  if (!from || !to) {
    return "—";
  }

  const seconds = Math.round((to - from) / 1000);

  return seconds === 0 ? "+0s" : `+${formatDuration(from, to)}`;
}

export function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number)
    ? number.toLocaleString()
    : "—";
}

export function titleCase(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
