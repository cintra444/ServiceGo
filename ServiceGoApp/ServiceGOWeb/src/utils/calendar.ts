function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toIcsDate(date: Date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

export function downloadCalendarEvent(params: {
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  notes?: string;
}) {
  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ServiceGO Web//PT-BR",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@servicego-web`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(params.startDate)}`,
    `DTEND:${toIcsDate(params.endDate)}`,
    `SUMMARY:${params.title}`,
    params.location ? `LOCATION:${params.location}` : "",
    params.notes ? `DESCRIPTION:${params.notes.replace(/\n/g, "\\n")}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "servicego-evento.ics";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
