export function currency(value?: number | null) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value ?? 0));
}

export function formatCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return "";
  }
  return currency(Number(digits) / 100);
}

export function parseCurrencyInput(value: string) {
  if (!value.trim()) {
    return undefined;
  }
  const normalized = value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? undefined : parsed;
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

export function maskDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function maskDateTimeInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  if (digits.length <= 8) {
    return maskDateInput(digits);
  }
  const datePart = maskDateInput(digits.slice(0, 8));
  const timeDigits = digits.slice(8);
  if (timeDigits.length <= 2) {
    return `${datePart} ${timeDigits}`;
  }
  return `${datePart} ${timeDigits.slice(0, 2)}:${timeDigits.slice(2)}`;
}

export function toNativeDateValue(value: string) {
  const normalized = value.trim();
  const match = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return "";
  }
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
}

export function fromNativeDateValue(value: string) {
  const normalized = value.trim();
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return "";
  }
  const [, yyyy, mm, dd] = match;
  return `${dd}/${mm}/${yyyy}`;
}

export function toNativeDateTimeValue(value: string) {
  const normalized = value.trim();
  const match = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (!match) {
    return "";
  }
  const [, dd, mm, yyyy, hh, min] = match;
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export function fromNativeDateTimeValue(value: string) {
  const normalized = value.trim();
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) {
    return "";
  }
  const [, yyyy, mm, dd, hh, min] = match;
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
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
