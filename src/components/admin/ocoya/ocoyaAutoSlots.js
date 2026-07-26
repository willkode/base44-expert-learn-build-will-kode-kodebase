// Next available posting slots in America/Chicago: 24 hours a day, every 30 minutes.
const TZ = "America/Chicago";
const START_HOUR = 0;
const END_HOUR = 23.5;
const STEP_MINUTES = 30;
const BUFFER_MS = 2 * 60 * 1000;

function offsetMinutes(date) {
  const str = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    timeZoneName: "shortOffset",
  }).format(date);
  const m = str.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!m) return -300;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (parseInt(m[2], 10) * 60 + (m[3] ? parseInt(m[3], 10) : 0));
}

// Local Chicago wall-clock parts -> ISO instant
function chicagoIso(y, monthIndex, day, hour, minute) {
  const guess = Date.UTC(y, monthIndex, day, hour, minute);
  const off = offsetMinutes(new Date(guess));
  return new Date(guess - off * 60000).toISOString();
}

function chicagoParts(date) {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  const [y, m, d] = f.split("-").map(Number);
  return { y, monthIndex: m - 1, day: d };
}

export function nextOpenSlots(count = 1, usedIso = []) {
  const used = new Set(usedIso.filter(Boolean));
  const now = Date.now();
  const slots = [];
  const { y, monthIndex, day } = chicagoParts(new Date());

  for (let dayOffset = 0; dayOffset < 60 && slots.length < count; dayOffset++) {
    for (let minutes = START_HOUR * 60; minutes <= END_HOUR * 60; minutes += STEP_MINUTES) {
      const iso = chicagoIso(
        y,
        monthIndex,
        day + dayOffset,
        Math.floor(minutes / 60),
        minutes % 60
      );
      if (new Date(iso).getTime() < now + BUFFER_MS) continue;
      if (used.has(iso)) continue;
      slots.push(iso);
      if (slots.length >= count) break;
    }
  }
  return slots;
}

export function slotLabelCST(iso) {
  if (!iso) return "—";
  return (
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso)) + " CST"
  );
}