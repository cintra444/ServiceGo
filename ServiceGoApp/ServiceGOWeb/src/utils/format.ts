export function currency(value?: number | null) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value ?? 0));
}

export function parseNumber(value: string) {
  if (!value.trim()) {
    return undefined;
  }
  const normalized = value.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function cleanText(value?: string) {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim();
  return normalized || undefined;
}

export function dateOnly(value?: string | null) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function dateTime(value?: string | null) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function toPtBrDateTime(iso?: string | null) {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (next: number) => String(next).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function toIsoFromPtBr(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }
  const match = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (!match) {
    return undefined;
  }
  const [, dd, mm, yyyy, hh, min] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), 0, 0);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function toOffsetIso(dateValue: string, endOfDay = false) {
  const normalized = dateValue.trim();
  const match = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return undefined;
  }
  const [, dd, mm, yyyy] = match;
  const hours = endOfDay ? 23 : 0;
  const minutes = endOfDay ? 59 : 0;
  const seconds = endOfDay ? 59 : 0;
  const localDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd), hours, minutes, seconds, 0);
  if (Number.isNaN(localDate.getTime())) {
    return undefined;
  }
  const pad = (next: number) => String(next).padStart(2, "0");
  const offsetMinutes = -localDate.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteOffset = Math.abs(offsetMinutes);
  const offsetHours = pad(Math.floor(absoluteOffset / 60));
  const offsetRemainder = pad(absoluteOffset % 60);
  return `${yyyy}-${mm}-${dd}T${pad(hours)}:${pad(minutes)}:${pad(seconds)}${sign}${offsetHours}:${offsetRemainder}`;
}
